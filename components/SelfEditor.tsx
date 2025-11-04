import { useState } from 'react';
import { FileSystem, FileNode, CodeLanguage } from '@/lib/fileSystem';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Code, FileCode, Search, Zap, Download, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CodeAnalysis {
  language: CodeLanguage;
  lines: number;
  characters: number;
  isEmpty: boolean;
  hasComments: boolean;
  hasFunctions: boolean;
}

interface SelfEditorProps {
  onFileModified?: (filePath: string) => void;
}

export function SelfEditor({ onFileModified }: SelfEditorProps) {
  const [selectedFile, setSelectedFile] = useState<string>('');
  const [codeToInject, setCodeToInject] = useState('');
  const [injectionPosition, setInjectionPosition] = useState<'start' | 'end'>('end');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{
    file: FileNode;
    matches: Array<{ line: number; text: string; column: number }>;
  }>>([]);
  const [replacePattern, setReplacePattern] = useState('');
  const [replaceWith, setReplaceWith] = useState('');
  const [analysis, setAnalysis] = useState<CodeAnalysis | null>(null);
  const { toast } = useToast();

  const allFiles = FileSystem.getAllCodeFiles();

  const handleAnalyze = () => {
    if (!selectedFile) {
      toast({
        title: 'No file selected',
        description: 'Please select a file to analyze',
        variant: 'destructive'
      });
      return;
    }

    const result = FileSystem.analyzeCode(selectedFile);
    if (result) {
      setAnalysis(result);
      toast({
        title: 'Analysis complete',
        description: `Found ${result.lines} lines of ${result.language} code`
      });
    }
  };

  const handleInjectCode = () => {
    if (!selectedFile || !codeToInject.trim()) {
      toast({
        title: 'Missing information',
        description: 'Please select a file and enter code to inject',
        variant: 'destructive'
      });
      return;
    }

    const success = FileSystem.injectCode(selectedFile, codeToInject, injectionPosition);
    if (success) {
      toast({
        title: 'Code injected',
        description: `Code added to ${injectionPosition} of file`
      });
      setCodeToInject('');
      onFileModified?.(selectedFile);
    } else {
      toast({
        title: 'Injection failed',
        description: 'Could not inject code into file',
        variant: 'destructive'
      });
    }
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      toast({
        title: 'Empty search',
        description: 'Please enter a search query',
        variant: 'destructive'
      });
      return;
    }

    const results = FileSystem.searchCode(searchQuery);
    setSearchResults(results);
    toast({
      title: 'Search complete',
      description: `Found ${results.reduce((sum, r) => sum + r.matches.length, 0)} matches in ${results.length} files`
    });
  };

  const handleReplace = () => {
    if (!selectedFile || !replacePattern.trim()) {
      toast({
        title: 'Missing information',
        description: 'Please select a file and enter a pattern to replace',
        variant: 'destructive'
      });
      return;
    }

    const success = FileSystem.replaceCode(selectedFile, replacePattern, replaceWith);
    if (success) {
      toast({
        title: 'Code replaced',
        description: 'Pattern replaced successfully'
      });
      setReplacePattern('');
      setReplaceWith('');
      onFileModified?.(selectedFile);
    } else {
      toast({
        title: 'Replace failed',
        description: 'Pattern not found in file',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="flex flex-col h-full p-4 gap-2">
      <Tabs defaultValue="inject" className="flex-1 overflow-hidden flex flex-col">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="inject" data-testid="tab-inject">
            <Upload className="h-4 w-4 mr-2" />
            Inject
          </TabsTrigger>
          <TabsTrigger value="search" data-testid="tab-search">
            <Search className="h-4 w-4 mr-2" />
            Search
          </TabsTrigger>
          <TabsTrigger value="replace" data-testid="tab-replace">
            <Code className="h-4 w-4 mr-2" />
            Replace
          </TabsTrigger>
          <TabsTrigger value="analyze" data-testid="tab-analyze">
            <FileCode className="h-4 w-4 mr-2" />
            Analyze
          </TabsTrigger>
        </TabsList>

        {/* Code Injection Tab */}
        <TabsContent value="inject" className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="space-y-4 pr-4">
              <Card>
                <CardHeader>
                  <CardTitle>Inject Code</CardTitle>
                  <CardDescription>
                    Insert code snippets into existing files
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Select File</label>
                    <select
                      data-testid="select-inject-file"
                      className="w-full p-2 border rounded-md bg-background"
                      value={selectedFile}
                      onChange={(e) => setSelectedFile(e.target.value)}
                    >
                      <option value="">Choose a file...</option>
                      {allFiles.map((file) => (
                        <option key={file.path} value={file.path}>
                          {file.path} ({file.language})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Code to Inject</label>
                    <Textarea
                      data-testid="textarea-inject-code"
                      placeholder="Enter code to inject..."
                      value={codeToInject}
                      onChange={(e) => setCodeToInject(e.target.value)}
                      className="font-mono text-sm min-h-[200px]"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Injection Position</label>
                    <div className="flex gap-2">
                      <Button
                        data-testid="button-position-start"
                        variant={injectionPosition === 'start' ? 'default' : 'outline'}
                        onClick={() => setInjectionPosition('start')}
                        className="flex-1"
                      >
                        Start of File
                      </Button>
                      <Button
                        data-testid="button-position-end"
                        variant={injectionPosition === 'end' ? 'default' : 'outline'}
                        onClick={() => setInjectionPosition('end')}
                        className="flex-1"
                      >
                        End of File
                      </Button>
                    </div>
                  </div>

                  <Button 
                    data-testid="button-inject"
                    onClick={handleInjectCode}
                    className="w-full bg-primary hover:bg-primary/90"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Inject Code
                  </Button>
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Code Search Tab */}
        <TabsContent value="search" className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="space-y-4 pr-4">
              <Card>
                <CardHeader>
                  <CardTitle>Search Code</CardTitle>
                  <CardDescription>
                    Find text across all code files
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      data-testid="input-search"
                      placeholder="Search for..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <Button data-testid="button-search" onClick={handleSearch}>
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>

                  {searchResults.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">
                        Found {searchResults.reduce((sum, r) => sum + r.matches.length, 0)} matches in {searchResults.length} files
                      </div>
                      {searchResults.map((result, idx) => (
                        <Card key={idx} className="bg-muted/50">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm flex items-center gap-2">
                              <FileCode className="h-4 w-4" />
                              {result.file.path}
                              <Badge variant="outline">{result.file.language}</Badge>
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-1 font-mono text-xs">
                              {result.matches.slice(0, 5).map((match, mIdx) => (
                                <div key={mIdx} className="p-2 bg-background rounded border">
                                  <span className="text-muted-foreground">Line {match.line}:</span>{' '}
                                  <span className="text-foreground">{match.text}</span>
                                </div>
                              ))}
                              {result.matches.length > 5 && (
                                <div className="text-muted-foreground text-center">
                                  +{result.matches.length - 5} more matches
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Code Replace Tab */}
        <TabsContent value="replace" className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="space-y-4 pr-4">
              <Card>
                <CardHeader>
                  <CardTitle>Replace Code</CardTitle>
                  <CardDescription>
                    Find and replace text in a file
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Select File</label>
                    <select
                      data-testid="select-replace-file"
                      className="w-full p-2 border rounded-md bg-background"
                      value={selectedFile}
                      onChange={(e) => setSelectedFile(e.target.value)}
                    >
                      <option value="">Choose a file...</option>
                      {allFiles.map((file) => (
                        <option key={file.path} value={file.path}>
                          {file.path} ({file.language})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Find Pattern</label>
                    <Input
                      data-testid="input-replace-pattern"
                      placeholder="Text or pattern to find..."
                      value={replacePattern}
                      onChange={(e) => setReplacePattern(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Replace With</label>
                    <Input
                      data-testid="input-replace-with"
                      placeholder="Replacement text..."
                      value={replaceWith}
                      onChange={(e) => setReplaceWith(e.target.value)}
                    />
                  </div>

                  <Button 
                    data-testid="button-replace"
                    onClick={handleReplace}
                    className="w-full bg-primary hover:bg-primary/90"
                  >
                    <Code className="h-4 w-4 mr-2" />
                    Replace Code
                  </Button>
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Code Analysis Tab */}
        <TabsContent value="analyze" className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="space-y-4 pr-4">
              <Card>
                <CardHeader>
                  <CardTitle>Code Analysis</CardTitle>
                  <CardDescription>
                    Analyze code structure and properties
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Select File</label>
                    <select
                      data-testid="select-analyze-file"
                      className="w-full p-2 border rounded-md bg-background"
                      value={selectedFile}
                      onChange={(e) => setSelectedFile(e.target.value)}
                    >
                      <option value="">Choose a file...</option>
                      {allFiles.map((file) => (
                        <option key={file.path} value={file.path}>
                          {file.path} ({file.language})
                        </option>
                      ))}
                    </select>
                  </div>

                  <Button 
                    data-testid="button-analyze"
                    onClick={handleAnalyze}
                    className="w-full bg-primary hover:bg-primary/90"
                  >
                    <FileCode className="h-4 w-4 mr-2" />
                    Analyze Code
                  </Button>

                  {analysis && (
                    <div className="grid grid-cols-2 gap-4 pt-4">
                      <Card>
                        <CardContent className="pt-6 text-center">
                          <div className="text-3xl font-bold text-primary">{analysis.lines}</div>
                          <div className="text-sm text-muted-foreground">Lines of Code</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-6 text-center">
                          <div className="text-3xl font-bold text-primary">{analysis.characters}</div>
                          <div className="text-sm text-muted-foreground">Characters</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-6 text-center">
                          <Badge variant={analysis.hasComments ? 'default' : 'outline'}>
                            {analysis.hasComments ? 'Yes' : 'No'}
                          </Badge>
                          <div className="text-sm text-muted-foreground mt-2">Has Comments</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-6 text-center">
                          <Badge variant={analysis.hasFunctions ? 'default' : 'outline'}>
                            {analysis.hasFunctions ? 'Yes' : 'No'}
                          </Badge>
                          <div className="text-sm text-muted-foreground mt-2">Has Functions</div>
                        </CardContent>
                      </Card>
                      <Card className="col-span-2">
                        <CardContent className="pt-6 text-center">
                          <Badge className="bg-primary hover:bg-primary/90 text-white">
                            {analysis.language.toUpperCase()}
                          </Badge>
                          <div className="text-sm text-muted-foreground mt-2">Language Detected</div>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {/* All Files Overview */}
                  <div className="pt-4 border-t">
                    <h3 className="text-sm font-medium mb-2">All Code Files</h3>
                    <div className="space-y-2">
                      {allFiles.map((file, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 rounded-md bg-muted/50 hover-elevate cursor-pointer"
                          onClick={() => setSelectedFile(file.path)}
                          data-testid={`file-item-${idx}`}
                        >
                          <div className="flex items-center gap-2">
                            <FileCode className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{file.path}</span>
                          </div>
                          <Badge variant="outline">{file.language}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
