import JSZip from "jszip";

export interface ZipFixResult {
  success: boolean;
  fixes: string[];
  warnings: string[];
  errors: string[];
}

/**
 * Auto-fix common ZIP issues:
 * - Empty folders (add .gitkeep)
 * - Invalid file paths (sanitize)
 * - Missing required files (add defaults)
 * - Corrupted entries (skip with warning)
 */
export class ZipAutoFix {
  private fixes: string[] = [];
  private warnings: string[] = [];
  private errors: string[] = [];

  /**
   * Fix empty folders by adding .gitkeep files
   */
  fixEmptyFolders(zip: JSZip): void {
    const folders = new Set<string>();
    const filesInFolders = new Set<string>();

    // Collect all folders and files
    Object.keys(zip.files).forEach(path => {
      const entry = zip.files[path];
      if (entry.dir) {
        folders.add(path);
      } else {
        // Track which folders have files
        const parts = path.split('/');
        for (let i = 1; i < parts.length; i++) {
          filesInFolders.add(parts.slice(0, i).join('/') + '/');
        }
      }
    });

    // Add .gitkeep to empty folders
    folders.forEach(folder => {
      if (!filesInFolders.has(folder)) {
        const gitkeepPath = folder + '.gitkeep';
        if (!zip.files[gitkeepPath]) {
          zip.file(gitkeepPath, '# Folder placeholder\n');
          this.fixes.push(`Added .gitkeep to empty folder: ${folder}`);
        }
      }
    });
  }

  /**
   * Sanitize file paths to prevent directory traversal and invalid characters
   */
  sanitizePath(path: string): string {
    // Remove leading slashes and ../ patterns
    let sanitized = path
      .replace(/^\/+/, '')
      .replace(/\.\.+/g, '.')
      .replace(/\/+/g, '/');

    // Remove invalid characters
    sanitized = sanitized.replace(/[<>:"|?*\x00-\x1F]/g, '_');

    if (sanitized !== path) {
      this.fixes.push(`Sanitized path: ${path} → ${sanitized}`);
    }

    return sanitized;
  }

  /**
   * Ensure a ZIP has at least one valid entry file
   */
  ensureEntryPoint(zip: JSZip): void {
    const validEntryPoints = ['index.html', 'index.htm', 'main.html', 'app.html'];
    const hasEntryPoint = validEntryPoints.some(entry => zip.files[entry]);

    if (!hasEntryPoint) {
      // Check for any HTML file
      const htmlFiles = Object.keys(zip.files).filter(path => 
        path.toLowerCase().endsWith('.html') && !zip.files[path].dir
      );

      if (htmlFiles.length === 0) {
        // Create a default index.html
        zip.file('index.html', `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Project</title>
</head>
<body>
  <h1>Welcome to your project!</h1>
  <p>Edit index.html to get started.</p>
</body>
</html>`);
        this.fixes.push('Added default index.html (no entry point found)');
      } else {
        this.warnings.push(`No standard entry point found. Detected: ${htmlFiles[0]}`);
      }
    }
  }

  /**
   * Remove problematic files that can cause issues
   */
  removeProblematicFiles(zip: JSZip): void {
    const problematicPatterns = [
      /^__MACOSX\//,
      /\.DS_Store$/,
      /Thumbs\.db$/,
      /desktop\.ini$/,
    ];

    Object.keys(zip.files).forEach(path => {
      if (problematicPatterns.some(pattern => pattern.test(path))) {
        zip.remove(path);
        this.fixes.push(`Removed system file: ${path}`);
      }
    });
  }

  /**
   * Validate and fix file encodings
   */
  async validateAndFixEncodings(zip: JSZip): Promise<void> {
    const textExtensions = ['.html', '.css', '.js', '.json', '.txt', '.md', '.xml', '.svg'];
    
    for (const [path, entry] of Object.entries(zip.files)) {
      if (entry.dir) continue;

      const ext = path.substring(path.lastIndexOf('.')).toLowerCase();
      if (!textExtensions.includes(ext)) continue;

      try {
        // Try to read as text to validate encoding
        await entry.async('text');
      } catch (error) {
        this.warnings.push(`Could not read text file: ${path}`);
        try {
          // Try to read as base64 and re-add
          const content = await entry.async('base64');
          zip.file(path, content, { base64: true });
          this.fixes.push(`Re-encoded file: ${path}`);
        } catch (reencodeError) {
          this.errors.push(`Failed to fix encoding for: ${path}`);
        }
      }
    }
  }

  /**
   * Process and fix a ZIP file
   */
  async processZip(zip: JSZip): Promise<ZipFixResult> {
    this.fixes = [];
    this.warnings = [];
    this.errors = [];

    try {
      // Apply fixes
      this.removeProblematicFiles(zip);
      this.fixEmptyFolders(zip);
      this.ensureEntryPoint(zip);
      await this.validateAndFixEncodings(zip);

      return {
        success: true,
        fixes: this.fixes,
        warnings: this.warnings,
        errors: this.errors
      };
    } catch (error: any) {
      this.errors.push(`Auto-fix failed: ${error.message}`);
      return {
        success: false,
        fixes: this.fixes,
        warnings: this.warnings,
        errors: this.errors
      };
    }
  }

  /**
   * Create a sanitized copy of a ZIP with all fixes applied
   */
  async createFixedZip(originalZip: JSZip): Promise<{ zip: JSZip; result: ZipFixResult }> {
    const newZip = new JSZip();
    
    // Copy all files with sanitized paths
    for (const [path, entry] of Object.entries(originalZip.files)) {
      const sanitizedPath = this.sanitizePath(path);
      
      if (entry.dir) {
        newZip.folder(sanitizedPath.replace(/\/$/, ''));
      } else {
        try {
          const content = await entry.async('uint8array');
          newZip.file(sanitizedPath, content);
        } catch (error) {
          this.errors.push(`Could not copy file: ${path}`);
        }
      }
    }

    const result = await this.processZip(newZip);
    return { zip: newZip, result };
  }

  /**
   * Quick validation without fixes
   */
  async validateZip(zip: JSZip): Promise<ZipFixResult> {
    const issues: string[] = [];
    const warnings: string[] = [];

    // Check for empty ZIP
    if (Object.keys(zip.files).length === 0) {
      issues.push('ZIP file is empty');
      return { success: false, fixes: [], warnings, errors: issues };
    }

    // Check for valid structure
    const hasFiles = Object.values(zip.files).some(entry => !entry.dir);
    if (!hasFiles) {
      issues.push('ZIP contains only folders, no files');
    }

    // Check for entry point
    const validEntryPoints = ['index.html', 'index.htm', 'main.html'];
    const hasEntryPoint = validEntryPoints.some(entry => zip.files[entry]);
    if (!hasEntryPoint) {
      warnings.push('No standard entry point (index.html) found');
    }

    return {
      success: issues.length === 0,
      fixes: [],
      warnings,
      errors: issues
    };
  }
}

/**
 * Convenience function to auto-fix a ZIP file
 */
export async function autoFixZip(file: File): Promise<{ 
  zip: JSZip; 
  result: ZipFixResult;
  originalSize: number;
  fixedSize: number;
}> {
  const originalZip = new JSZip();
  const contents = await originalZip.loadAsync(file);
  
  const fixer = new ZipAutoFix();
  const { zip: fixedZip, result } = await fixer.createFixedZip(contents);
  
  const originalBlob = await contents.generateAsync({ type: 'blob' });
  const fixedBlob = await fixedZip.generateAsync({ type: 'blob' });
  
  return {
    zip: fixedZip,
    result,
    originalSize: originalBlob.size,
    fixedSize: fixedBlob.size
  };
}
