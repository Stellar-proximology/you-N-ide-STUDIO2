import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Loader2, Volume2, VolumeX, Calendar, MapPin, Sparkles, Save, Trash2, Filter } from 'lucide-react';

interface CalibrationResult {
  charts: Record<string, any>;
  oscillatorSeeds: Record<string, any>;
  interpretation?: {
    summary: string;
    layerInsights: Record<string, string>;
    calibrationGuidance: string;
    dominantThemes: string[];
    energySignature: string;
  };
  voiceReadings?: Record<string, any>;
}

interface SavedCalibration {
  id: string;
  name: string;
  birthData: {
    datetime: string;
    latitude: number;
    longitude: number;
  };
  result: CalibrationResult;
  timestamp: string;
  energySignature: string;
}

export default function ConsciousnessCalibrator() {
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [timezone, setTimezone] = useState('America/New_York');
  const [withVoice, setWithVoice] = useState(true);
  const [result, setResult] = useState<CalibrationResult | null>(null);
  const [playingLayer, setPlayingLayer] = useState<string | null>(null);
  const [savedCalibrations, setSavedCalibrations] = useState<SavedCalibration[]>([]);
  const [calibrationName, setCalibrationName] = useState('');
  const [energyFilter, setEnergyFilter] = useState('');

  // Load saved calibrations from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('consciousness_calibrations');
    if (saved) {
      try {
        setSavedCalibrations(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load calibrations:', e);
      }
    }
  }, []);

  // Save calibrations to localStorage whenever they change
  useEffect(() => {
    if (savedCalibrations.length > 0) {
      localStorage.setItem('consciousness_calibrations', JSON.stringify(savedCalibrations));
    }
  }, [savedCalibrations]);

  const calibrateMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('/api/consciousness/calibrate', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: (data) => {
      setResult(data);
    },
  });

  const handleCalibrate = () => {
    if (!birthDate || !birthTime || !latitude || !longitude) {
      alert('Please fill in all birth data fields');
      return;
    }

    const datetime = `${birthDate}T${birthTime}`;

    calibrateMutation.mutate({
      datetime,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      timezone,
      withVoice,
      withLLMInterpretation: true,
    });
  };

  const saveCalibration = () => {
    if (!result || !calibrationName.trim()) {
      alert('Please enter a name for this calibration');
      return;
    }

    const newCalibration: SavedCalibration = {
      id: Date.now().toString(),
      name: calibrationName,
      birthData: {
        datetime: `${birthDate}T${birthTime}`,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
      },
      result,
      timestamp: new Date().toISOString(),
      energySignature: result.interpretation?.energySignature || 'Unknown signature',
    };

    setSavedCalibrations([newCalibration, ...savedCalibrations]);
    setCalibrationName('');
  };

  const loadCalibration = (calibration: SavedCalibration) => {
    const [date, time] = calibration.birthData.datetime.split('T');
    setBirthDate(date);
    setBirthTime(time);
    setLatitude(calibration.birthData.latitude.toString());
    setLongitude(calibration.birthData.longitude.toString());
    setResult(calibration.result);
  };

  const deleteCalibration = (id: string) => {
    setSavedCalibrations(savedCalibrations.filter(c => c.id !== id));
  };

  const calculateEnergyAlignment = (cal1: CalibrationResult, cal2: CalibrationResult): number => {
    if (!cal1.oscillatorSeeds || !cal2.oscillatorSeeds) return 0;
    
    let totalAlignment = 0;
    let centerCount = 0;
    
    Object.keys(cal1.oscillatorSeeds).forEach(center => {
      if (cal2.oscillatorSeeds[center]) {
        const amp1 = cal1.oscillatorSeeds[center].amplitude;
        const amp2 = cal2.oscillatorSeeds[center].amplitude;
        const phase1 = cal1.oscillatorSeeds[center].phase;
        const phase2 = cal2.oscillatorSeeds[center].phase;
        
        const ampAlignment = 1 - Math.abs(amp1 - amp2);
        const phaseDiff = Math.abs(phase1 - phase2);
        const phaseAlignment = 1 - (phaseDiff / (2 * Math.PI));
        
        totalAlignment += (ampAlignment + phaseAlignment) / 2;
        centerCount++;
      }
    });
    
    return centerCount > 0 ? (totalAlignment / centerCount) * 100 : 0;
  };

  const filteredCalibrations = savedCalibrations.filter(cal => {
    if (!energyFilter) return true;
    return cal.name.toLowerCase().includes(energyFilter.toLowerCase()) ||
           cal.energySignature.toLowerCase().includes(energyFilter.toLowerCase());
  });

  const playLayerVoice = (layer: string, text: string) => {
    if (playingLayer === layer) {
      speechSynthesis.cancel();
      setPlayingLayer(null);
      return;
    }

    speechSynthesis.cancel();
    
    const layerProfiles: Record<string, { pitch: number; rate: number }> = {
      BEING: { pitch: 0.75, rate: 0.85 },
      MOVEMENT: { pitch: 1.17, rate: 1.2 },
      EVOLUTION: { pitch: 1.0, rate: 0.95 },
      DESIGN: { pitch: 1.08, rate: 1.05 },
      SPACE: { pitch: 0.92, rate: 0.9 },
      TRANSPERSONAL: { pitch: 1.25, rate: 0.8 },
      VOID: { pitch: 0.5, rate: 0.7 },
    };

    const profile = layerProfiles[layer] || { pitch: 1.0, rate: 1.0 };
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.pitch = profile.pitch;
    utterance.rate = profile.rate;
    utterance.volume = 1.0;

    const voices = speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.lang.startsWith('en')) || voices[0];
    if (preferredVoice) utterance.voice = preferredVoice;

    utterance.onend = () => setPlayingLayer(null);
    utterance.onerror = () => setPlayingLayer(null);

    setPlayingLayer(layer);
    speechSynthesis.speak(utterance);
  };

  const getLayerColor = (layer: string): string => {
    const colors: Record<string, string> = {
      BEING: 'bg-amber-500',
      MOVEMENT: 'bg-cyan-500',
      EVOLUTION: 'bg-emerald-500',
      DESIGN: 'bg-violet-500',
      SPACE: 'bg-blue-500',
      TRANSPERSONAL: 'bg-pink-500',
      VOID: 'bg-slate-500',
    };
    return colors[layer] || 'bg-primary';
  };

  const getLayerDescription = (layer: string): string => {
    const descriptions: Record<string, string> = {
      BEING: 'Physical/Genetic Foundation',
      MOVEMENT: 'Temporal Movement State',
      EVOLUTION: 'Developmental Arc',
      DESIGN: 'Yearly Intentions',
      SPACE: 'Emotional Cycles',
      TRANSPERSONAL: 'Relational Field',
      VOID: 'Soul Purpose',
    };
    return descriptions[layer] || '';
  };

  return (
    <div className="h-full overflow-auto bg-background p-4">
      <div className="max-w-5xl mx-auto space-y-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Consciousness Calibration</h1>
          <p className="text-sm text-muted-foreground">
            Calculate your 7-layer consciousness field and calibrate the ERN oscillator
          </p>
        </div>

        <Tabs defaultValue="input" className="space-y-6">
          <TabsList>
            <TabsTrigger value="input" data-testid="tab-input">Birth Data</TabsTrigger>
            <TabsTrigger value="results" disabled={!result} data-testid="tab-results">
              Calibration Results
            </TabsTrigger>
            <TabsTrigger value="oscillator" disabled={!result} data-testid="tab-oscillator">
              ERN Oscillator
            </TabsTrigger>
            <TabsTrigger value="library" data-testid="tab-library">
              Library ({savedCalibrations.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="input" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Birth Information
                </CardTitle>
                <CardDescription>
                  Enter your birth data to calculate all 7 consciousness charts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="birth-date">Birth Date</Label>
                    <Input
                      id="birth-date"
                      type="date"
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      data-testid="input-birth-date"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="birth-time">Birth Time</Label>
                    <Input
                      id="birth-time"
                      type="time"
                      value={birthTime}
                      onChange={(e) => setBirthTime(e.target.value)}
                      data-testid="input-birth-time"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Birth Location
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="latitude" className="text-sm text-muted-foreground">
                        Latitude
                      </Label>
                      <Input
                        id="latitude"
                        type="number"
                        step="0.0001"
                        placeholder="40.7128"
                        value={latitude}
                        onChange={(e) => setLatitude(e.target.value)}
                        data-testid="input-latitude"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="longitude" className="text-sm text-muted-foreground">
                        Longitude
                      </Label>
                      <Input
                        id="longitude"
                        type="number"
                        step="0.0001"
                        placeholder="-74.0060"
                        value={longitude}
                        onChange={(e) => setLongitude(e.target.value)}
                        data-testid="input-longitude"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <select
                    id="timezone"
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
                    data-testid="select-timezone"
                  >
                    <option value="America/New_York">Eastern Time (US)</option>
                    <option value="America/Chicago">Central Time (US)</option>
                    <option value="America/Denver">Mountain Time (US)</option>
                    <option value="America/Los_Angeles">Pacific Time (US)</option>
                    <option value="Europe/London">London</option>
                    <option value="Europe/Paris">Paris</option>
                    <option value="Asia/Tokyo">Tokyo</option>
                    <option value="Australia/Sydney">Sydney</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="with-voice"
                    checked={withVoice}
                    onChange={(e) => setWithVoice(e.target.checked)}
                    className="rounded"
                    data-testid="checkbox-voice"
                  />
                  <Label htmlFor="with-voice" className="flex items-center gap-2 cursor-pointer">
                    <Volume2 className="w-4 h-4" />
                    Generate voice readings for each layer
                  </Label>
                </div>

                <Button
                  onClick={handleCalibrate}
                  disabled={calibrateMutation.isPending}
                  className="w-full"
                  data-testid="button-calibrate"
                >
                  {calibrateMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Calculating Consciousness Field...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Calculate 7-Layer Calibration
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="results" className="space-y-6">
            {result?.interpretation && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Save Calibration</CardTitle>
                    <CardDescription>Save this calibration for future reference and alignment</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter calibration name..."
                        value={calibrationName}
                        onChange={(e) => setCalibrationName(e.target.value)}
                        data-testid="input-calibration-name"
                      />
                      <Button onClick={saveCalibration} data-testid="button-save-calibration">
                        <Save className="w-4 h-4 mr-2" />
                        Save
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Consciousness Signature</CardTitle>
                    <CardDescription>{result.interpretation.energySignature}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed">{result.interpretation.summary}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Dominant Themes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {result.interpretation.dominantThemes.map((theme, idx) => (
                        <Badge key={idx} variant="secondary" data-testid={`badge-theme-${idx}`}>
                          {theme}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>7-Layer Insights</CardTitle>
                    <CardDescription>
                      Each layer represents a different aspect of your consciousness field
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {Object.entries(result.interpretation.layerInsights).map(([layer, insight]) => (
                      <div key={layer} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${getLayerColor(layer)}`} />
                            <h3 className="font-semibold">{layer}</h3>
                            <span className="text-xs text-muted-foreground">
                              {getLayerDescription(layer)}
                            </span>
                          </div>
                          {withVoice && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => playLayerVoice(layer, insight)}
                              data-testid={`button-play-${layer}`}
                            >
                              {playingLayer === layer ? (
                                <VolumeX className="w-4 h-4" />
                              ) : (
                                <Volume2 className="w-4 h-4" />
                              )}
                            </Button>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed pl-5">
                          {insight}
                        </p>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Calibration Guidance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed">
                      {result.interpretation.calibrationGuidance}
                    </p>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          <TabsContent value="oscillator" className="space-y-6">
            {result?.oscillatorSeeds && (
              <Card>
                <CardHeader>
                  <CardTitle>ERN Oscillator Calibration</CardTitle>
                  <CardDescription>
                    Energy center activations for consciousness field initialization
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(result.oscillatorSeeds).map(([center, activation]: [string, any]) => (
                    <div key={center} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">{center}</Label>
                        <span className="text-xs text-muted-foreground">
                          {(activation.amplitude * 100).toFixed(0)}%
                        </span>
                      </div>
                      <Progress value={activation.amplitude * 100} className="h-2" />
                      <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                        <div>Phase: {activation.phase.toFixed(2)}</div>
                        <div>Frequency: {activation.frequency.toFixed(2)}Hz</div>
                        <div>Amplitude: {activation.amplitude.toFixed(3)}</div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="library" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Continuity Filter
                </CardTitle>
                <CardDescription>
                  Filter and align consciousness calibrations by energy signature
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Input
                  placeholder="Filter by name or energy signature..."
                  value={energyFilter}
                  onChange={(e) => setEnergyFilter(e.target.value)}
                  data-testid="input-energy-filter"
                />
              </CardContent>
            </Card>

            {filteredCalibrations.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <Sparkles className="w-12 h-12 text-muted-foreground mb-4" />
                  <h3 className="font-semibold text-lg mb-2">No Calibrations Yet</h3>
                  <p className="text-sm text-muted-foreground">
                    Calculate and save your first consciousness calibration to begin building your library
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredCalibrations.map((calibration) => {
                  const alignment = result ? calculateEnergyAlignment(calibration.result, result) : null;
                  
                  return (
                    <Card key={calibration.id} className="hover-elevate">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <CardTitle className="text-lg">{calibration.name}</CardTitle>
                            <CardDescription className="text-xs">
                              {new Date(calibration.timestamp).toLocaleDateString()}
                            </CardDescription>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteCalibration(calibration.id)}
                            data-testid={`button-delete-${calibration.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground">Energy Signature</Label>
                          <p className="text-sm">{calibration.energySignature}</p>
                        </div>

                        {alignment !== null && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label className="text-xs text-muted-foreground">Energy Alignment</Label>
                              <span className="text-xs font-medium">{alignment.toFixed(1)}%</span>
                            </div>
                            <Progress value={alignment} className="h-2" />
                          </div>
                        )}

                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => loadCalibration(calibration)}
                          data-testid={`button-load-${calibration.id}`}
                        >
                          Load Calibration
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
