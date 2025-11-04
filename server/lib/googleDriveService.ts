import { google } from 'googleapis';

let connectionSettings: any;

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings?.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  const response = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connection_names=google-drive',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  );

  const data = await response.json();
  connectionSettings = data.items?.[0];

  if (!connectionSettings) {
    throw new Error('Google Drive not connected');
  }

  const accessToken = connectionSettings.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;

  if (!accessToken) {
    throw new Error('Google Drive not connected');
  }
  
  return accessToken;
}

// WARNING: Never cache this client.
// Access tokens expire, so a new client must be created each time.
// Always call this function again to get a fresh client.
export async function getUncachableGoogleDriveClient() {
  const accessToken = await getAccessToken();

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({
    access_token: accessToken
  });

  return google.drive({ version: 'v3', auth: oauth2Client });
}

export async function uploadFileToGoogleDrive(fileName: string, content: string, mimeType: string = 'text/plain') {
  const drive = await getUncachableGoogleDriveClient();

  const fileMetadata = {
    name: fileName,
  };

  const media = {
    mimeType,
    body: content,
  };

  const response = await drive.files.create({
    requestBody: fileMetadata,
    media,
    fields: 'id, name, webViewLink',
  });

  return response.data;
}

export async function uploadProjectToGoogleDrive(projectName: string, files: Array<{ path: string; content: string }>) {
  const drive = await getUncachableGoogleDriveClient();

  // Create a folder for the project
  const folderMetadata = {
    name: projectName,
    mimeType: 'application/vnd.google-apps.folder',
  };

  const folderResponse = await drive.files.create({
    requestBody: folderMetadata,
    fields: 'id, name, webViewLink',
  });

  const rootFolderId = folderResponse.data.id;
  const folderCache = new Map<string, string>();
  folderCache.set('', rootFolderId!);

  // Helper to create or get folder ID
  async function ensureFolder(path: string): Promise<string> {
    if (folderCache.has(path)) {
      return folderCache.get(path)!;
    }

    const parts = path.split('/');
    let currentPath = '';
    let parentId = rootFolderId!;

    for (const part of parts) {
      if (!part) continue;
      currentPath = currentPath ? `${currentPath}/${part}` : part;

      if (folderCache.has(currentPath)) {
        parentId = folderCache.get(currentPath)!;
      } else {
        const folderMetadata = {
          name: part,
          mimeType: 'application/vnd.google-apps.folder',
          parents: [parentId],
        };

        const response = await drive.files.create({
          requestBody: folderMetadata,
          fields: 'id',
        });

        parentId = response.data.id!;
        folderCache.set(currentPath, parentId);
      }
    }

    return parentId;
  }

  // Upload all files preserving directory structure
  const uploadedFiles = [];
  for (const file of files) {
    const pathParts = file.path.split('/');
    const fileName = pathParts.pop() || file.path;
    const dirPath = pathParts.join('/');

    const parentFolderId = await ensureFolder(dirPath);

    const fileMetadata = {
      name: fileName,
      parents: [parentFolderId],
    };

    const media = {
      mimeType: 'text/plain',
      body: file.content || '', // Include empty files
    };

    const fileResponse = await drive.files.create({
      requestBody: fileMetadata,
      media,
      fields: 'id, name, webViewLink',
    });

    uploadedFiles.push(fileResponse.data);
  }

  return {
    folder: folderResponse.data,
    files: uploadedFiles,
  };
}
