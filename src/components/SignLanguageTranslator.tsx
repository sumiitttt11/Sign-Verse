import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Camera, CameraOff, Mic, MicOff, Volume2, VolumeX, Brain, Zap, Target } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AdvancedGestureRecognizer } from '@/lib/advancedGestureRecognizer';
import SignLearning from '@/components/SignLearning';

// MediaPipe imports
declare global {
  interface Window {
    Hands: any;
    Camera: any;
    drawConnectors: any;
    drawLandmarks: any;
    HAND_CONNECTIONS: any;
  }
}

interface HandLandmark {
  x: number;
  y: number;
  z: number;
}

interface DetectionResult {
  multiHandLandmarks: HandLandmark[][];
  multiHandedness: Array<{ label: string; score: number }>;
}

const SignLanguageTranslator: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gestureRecognizer = useRef(new AdvancedGestureRecognizer());
  const [isActive, setIsActive] = useState(false);
  const [translatedText, setTranslatedText] = useState('');
  const [detectedGesture, setDetectedGesture] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState("english");
  const [detectionStats, setDetectionStats] = useState({
    totalDetections: 0,
    avgConfidence: 0,
    lastUpdate: Date.now()
  });
  const [recentGestures, setRecentGestures] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('translate');
  const { toast } = useToast();

  // Enhanced gesture recognition using the advanced recognizer
  const recognizeGesture = useCallback((landmarks: HandLandmark[]) => {
    if (!landmarks || landmarks.length === 0) return null;

    const result = gestureRecognizer.current.recognizeGesture(landmarks);
    if (result) {
      // Update detection statistics
      setDetectionStats(prev => ({
        totalDetections: prev.totalDetections + 1,
        avgConfidence: (prev.avgConfidence * prev.totalDetections + result.confidence) / (prev.totalDetections + 1),
        lastUpdate: Date.now()
      }));

      // Add to recent gestures for sequence recognition
      setRecentGestures(prev => {
        const updated = [...prev, result.gesture].slice(-10); // Keep last 10 gestures
        
        // Check for word sequences
        const wordSequence = gestureRecognizer.current.recognizeWordSequence(updated);
        if (wordSequence) {
          return [wordSequence]; // Replace with recognized word
        }
        
        return updated;
      });
    }

    return result;
  }, []);

  const speakText = useCallback((text: string) => {
    if (!audioEnabled || !text) return;
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.8;
    utterance.pitch = 1;
    speechSynthesis.speak(utterance);
  }, [audioEnabled]);

  const initializeMediaPipe = useCallback(async () => {
    if (!window.Hands) {
      toast({
        title: "Loading Advanced AI Models...",
        description: "Initializing enhanced hand detection with multiple recognition algorithms.",
      });
      return;
    }

    const hands = new window.Hands({
      locateFile: (file: string) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
      }
    });

    // Enhanced MediaPipe settings for better accuracy
    hands.setOptions({
      maxNumHands: 2,
      modelComplexity: 1, // Higher complexity for better accuracy
      minDetectionConfidence: 0.7, // Higher threshold
      minTrackingConfidence: 0.7,  // Higher threshold
      staticImageMode: false,
      selfieMode: true,
      enableFaceDetection: false
    });

    hands.onResults((results: DetectionResult) => {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      if (!canvas || !video) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.save();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        results.multiHandLandmarks.forEach((landmarks, index) => {
          // Enhanced visual feedback with different colors for different hands
          const handColor = index === 0 ? '#3B82F6' : '#8B5CF6'; // Blue for primary, purple for secondary
          const connectionColor = index === 0 ? '#60A5FA' : '#A78BFA';

          window.drawConnectors(ctx, landmarks, window.HAND_CONNECTIONS, {
            color: connectionColor,
            lineWidth: 3
          });
          window.drawLandmarks(ctx, landmarks, {
            color: handColor,
            lineWidth: 2,
            radius: 4
          });

          // Advanced gesture recognition
          const recognition = recognizeGesture(landmarks);
          if (recognition && recognition.confidence > 0.7) {
            setDetectedGesture(recognition.gesture);
            setConfidence(recognition.confidence);
            
            // Smart text building - avoid repetition
            setTranslatedText(prev => {
              const words = prev.split(' ').filter(Boolean);
              const lastWord = words[words.length - 1];
              
              if (lastWord !== recognition.gesture) {
                return prev ? `${prev} ${recognition.gesture}` : recognition.gesture;
              }
              return prev;
            });

            // Visual feedback for high confidence detections
            if (recognition.confidence > 0.85) {
              ctx.fillStyle = 'rgba(34, 197, 94, 0.2)'; // Green overlay for high confidence
              ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
          }
        });
      }
      ctx.restore();
    });

    return hands;
  }, [recognizeGesture, toast]);

  const startCamera = useCallback(async () => {
    setIsLoading(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current.play();
          }
        };
      }

      const hands = await initializeMediaPipe();
      if (hands && videoRef.current) {
        const camera = new window.Camera(videoRef.current, {
          onFrame: async () => {
            if (videoRef.current) {
              await hands.send({ image: videoRef.current });
            }
          },
          width: 640,
          height: 480
        });
        camera.start();
      }

      setIsActive(true);
      toast({
        title: "Advanced AI Detection Active",
        description: "Multi-algorithm gesture recognition is now running with enhanced accuracy.",
      });
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast({
        title: "Camera access error",
        description: "Unable to access camera. Please check permissions and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [initializeMediaPipe, toast]);

  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsActive(false);
    setDetectedGesture('');
    setConfidence(0);
    setRecentGestures([]);
    setDetectionStats({
      totalDetections: 0,
      avgConfidence: 0,
      lastUpdate: Date.now()
    });
  }, []);

  const clearTranslation = useCallback(() => {
    setTranslatedText('');
    setDetectedGesture('');
    setConfidence(0);
    setRecentGestures([]);
  }, []);

  const handleSpeak = useCallback(() => {
    if (translatedText) {
      speakText(translatedText);
    }
  }, [translatedText, speakText]);

  const handleGestureGenerated = useCallback((gesture: string) => {
    // This could be enhanced to show generated sign images
    toast({
      title: `Sign for "${gesture}"`,
      description: "Check the learning tab for detailed instructions.",
    });
  }, [toast]);

  // Load MediaPipe scripts
  useEffect(() => {
    const loadScript = (src: string) => {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    };

    const loadMediaPipe = async () => {
      try {
        await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js');
        await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js');
        await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js');
      } catch (error) {
        console.error('Failed to load MediaPipe scripts:', error);
        toast({
          title: "Loading error",
          description: "Failed to load required libraries for hand detection.",
          variant: "destructive",
        });
      }
    };

    if (!window.Hands) {
      loadMediaPipe();
    }
  }, [toast]);

  return (
  <div className="min-h-screen p-6 pt-24">   {/* ⬅️ Added pt-24 for spacing below navbar */}
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Enhanced Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
          Advanced AI Sign Language Translator
        </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Multi-algorithm ASL recognition with advanced computer vision and machine learning
          </p>
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Brain className="h-4 w-4 text-primary" />
              <span>Multi-Algorithm Detection</span>
            </div>
            <div className="flex items-center gap-1">
              <Zap className="h-4 w-4 text-secondary" />
              <span>Real-time Processing</span>
            </div>
            <div className="flex items-center gap-1">
              <Target className="h-4 w-4 text-accent" />
              <span>High Accuracy</span>
            </div>
          </div>
        </div>

        {/* Main Interface with Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* <TabsList className="grid w-full grid-cols-2 glass"> */}
            {/* <TabsTrigger value="translate">Live Translation</TabsTrigger> */}
            {/* <TabsTrigger value="learn">Learn Signs</TabsTrigger> */}
          {/* </TabsList> */}

          <TabsContent value="translate" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Video Feed with Enhanced UI */}
              <Card className="glass">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Camera className="h-5 w-5" />
                      Advanced Video Analysis
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      {isActive && (
                        <Badge variant="secondary" className="animate-pulse-glow">
                          <Brain className="h-3 w-3 mr-1" />
                          AI Active
                        </Badge>
                      )}
                      <Button
                        variant={isActive ? "destructive" : "default"}
                        onClick={isActive ? stopCamera : startCamera}
                        disabled={isLoading}
                        className="min-w-[100px]"
                      >
                        {isLoading ? (
                          "Initializing..."
                        ) : isActive ? (
                          <>
                            <CameraOff className="h-4 w-4 mr-2" />
                            Stop
                          </>
                        ) : (
                          <>
                            <Camera className="h-4 w-4 mr-2" />
                            Start AI Detection
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative bg-muted rounded-lg overflow-hidden aspect-video">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  style={{ transform: 'scaleX(-1)' }}
                />
                <canvas
                  ref={canvasRef}
                  width={640}
                  height={480}
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ transform: 'scaleX(-1)' }}
                />
                {!isActive && (
                  <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
                    <p className="text-muted-foreground">Camera inactive</p>
                  </div>
                )}
              </div>

                {/* Enhanced Detection Status */}
                {detectedGesture && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg border border-primary/20">
                      <div>
                        <p className="font-semibold text-primary text-lg">
                          Detected: {detectedGesture}
                        </p>
                        <div className="flex items-center gap-4 mt-1">
                          <p className="text-sm text-muted-foreground">
                            Confidence: {(confidence * 100).toFixed(1)}%
                          </p>
                          <div className="flex items-center gap-1">
                            <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300"
                                style={{ width: `${confidence * 100}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      <Badge 
                        variant={confidence > 0.8 ? "default" : "secondary"} 
                        className="animate-pulse-glow"
                      >
                        {confidence > 0.8 ? "High Confidence" : "Detecting"}
                      </Badge>
                    </div>

                    {/* Detection Statistics */}
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="text-center p-2 bg-muted/30 rounded">
                        <div className="font-semibold">{detectionStats.totalDetections}</div>
                        <div className="text-muted-foreground">Total</div>
                      </div>
                      <div className="text-center p-2 bg-muted/30 rounded">
                        <div className="font-semibold">{(detectionStats.avgConfidence * 100).toFixed(0)}%</div>
                        <div className="text-muted-foreground">Avg Conf</div>
                      </div>
                      <div className="text-center p-2 bg-muted/30 rounded">
                        <div className="font-semibold">{recentGestures.length}</div>
                        <div className="text-muted-foreground">Sequence</div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Enhanced Translation Output */}
            {/* <Card className="glass">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Smart Translation Output</CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setAudioEnabled(!audioEnabled)}
                    >
                      {audioEnabled ? (
                        <Volume2 className="h-4 w-4" />
                      ) : (
                        <VolumeX className="h-4 w-4" />
                      )}
                    </Button>
                    <Button variant="outline" size="sm" onClick={clearTranslation}>
                      Clear
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="min-h-[200px] p-4 bg-muted rounded-lg border">
                  {translatedText ? (
                    <div className="space-y-2">
                      <p className="text-lg leading-relaxed">{translatedText}</p>
                      {recentGestures.length > 0 && (
                        <div className="text-sm text-muted-foreground">
                          <span>Recent sequence: </span>
                          <span className="font-mono">{recentGestures.join(' → ')}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-muted-foreground italic text-center">
                        AI translation will appear here...<br />
                        <span className="text-xs">Advanced multi-algorithm recognition active</span>
                      </p>
                    </div>
                  )}
                </div>

                {translatedText && (
                  <div className="flex gap-2">
                    <Button onClick={handleSpeak} className="flex-1">
                      <Mic className="h-4 w-4 mr-2" />
                      Speak Translation
                    </Button>
                  </div>
                )}

                {/* Enhanced Features Info */}
                {/* <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                  <div className="text-center p-3 bg-primary/5 rounded-lg">
                    <Brain className="h-6 w-6 text-primary mx-auto mb-2" />
                    <h4 className="font-semibold text-primary text-sm">AI Recognition</h4>
                    <p className="text-xs text-muted-foreground">Multi-algorithm detection</p>
                  </div>
                  <div className="text-center p-3 bg-secondary/5 rounded-lg">
                    <Zap className="h-6 w-6 text-secondary mx-auto mb-2" />
                    <h4 className="font-semibold text-secondary text-sm">Real-time</h4>
                    <p className="text-xs text-muted-foreground">Live processing</p>
                  </div>
                  <div className="text-center p-3 bg-accent/5 rounded-lg">
                    <Target className="h-6 w-6 text-accent mx-auto mb-2" />
                    <h4 className="font-semibold text-accent text-sm">High Accuracy</h4>
                    <p className="text-xs text-muted-foreground">Advanced confidence</p>
                  </div>
                </div>
              </CardContent> */} 
            {/* </Card> */}
            {/* Enhanced Translation Output */}
              <Card className="glass bg-gray-900 text-white">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-gray-100">Smart Translation Output</CardTitle>
                    <div className="flex gap-2 items-center">
                      {/* Language Dropdown */}
                      <select
                        className="border border-gray-600 bg-gray-800 text-gray-100 rounded-md px-2 py-1 text-sm"
                        value={selectedLanguage}
                        onChange={(e) => setSelectedLanguage(e.target.value)}
                      >
                        <option value="english">English</option>
                        <option value="hindi">Hindi</option>
                      </select>

                      <Button
                        variant="outline"
                        size="sm"
                        className="border-gray-600 text-gray-100"
                        onClick={() => setAudioEnabled(!audioEnabled)}
                      >
                        {audioEnabled ? (
                          <Volume2 className="h-4 w-4" />
                        ) : (
                          <VolumeX className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-gray-600 text-gray-100"
                        onClick={clearTranslation}
                      >
                        Clear
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="min-h-[200px] p-4 bg-gray-800 rounded-lg border border-gray-700">
                    {translatedText ? (
                      <div className="space-y-2">
                        <p className="text-lg leading-relaxed text-gray-100">
                          {selectedLanguage === "english"
                            ? translatedText
                            : "अनुवादित हिंदी टेक्स्ट"}
                        </p>
                        {recentGestures.length > 0 && (
                          <div className="text-sm text-gray-400">
                            <span>Recent sequence: </span>
                            <span className="font-mono">{recentGestures.join(" → ")}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="italic text-center text-gray-400">
                          AI translation will appear here...<br />
                          <span className="text-xs text-gray-500">
                            Advanced multi-algorithm recognition active
                          </span>
                        </p>
                      </div>
                    )}
                  </div>

                  {translatedText && (
                    <div className="flex gap-2">
                      <Button onClick={handleSpeak} className="flex-1 bg-gray-700 text-gray-100 hover:bg-gray-600">
                        <Mic className="h-4 w-4 mr-2" />
                        Speak Translation
                      </Button>
                    </div>
                  )}

                  {/* Enhanced Features Info */}
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-700">
                    <div className="text-center p-3 bg-gray-700 rounded-lg">
                      <Brain className="h-6 w-6 text-blue-400 mx-auto mb-2" />
                      <h4 className="font-semibold text-blue-400 text-sm">AI Recognition</h4>
                      <p className="text-xs text-gray-400">Multi-algorithm detection</p>
                    </div>
                    <div className="text-center p-3 bg-gray-700 rounded-lg">
                      <Zap className="h-6 w-6 text-yellow-400 mx-auto mb-2" />
                      <h4 className="font-semibold text-yellow-400 text-sm">Real-time</h4>
                      <p className="text-xs text-gray-400">Live processing</p>
                    </div>
                    <div className="text-center p-3 bg-gray-700 rounded-lg">
                      <Target className="h-6 w-6 text-green-400 mx-auto mb-2" />
                      <h4 className="font-semibold text-green-400 text-sm">High Accuracy</h4>
                      <p className="text-xs text-gray-400">Advanced confidence</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

          </div>
          </TabsContent>

          <TabsContent value="learn" className="space-y-6 mt-6">
            <SignLearning onGestureGenerated={handleGestureGenerated} />
          </TabsContent>
        </Tabs>

        {/* Enhanced Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="glass">
            <CardContent className="p-4 text-center">
              <Brain className="h-8 w-8 text-primary mx-auto mb-2" />
              <h3 className="font-semibold text-primary mb-2">Multi-Algorithm AI</h3>
              <p className="text-sm text-muted-foreground">
                Advanced computer vision with multiple recognition approaches for maximum accuracy
              </p>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardContent className="p-4 text-center">
              <Zap className="h-8 w-8 text-secondary mx-auto mb-2" />
              <h3 className="font-semibold text-secondary mb-2">Real-time Processing</h3>
              <p className="text-sm text-muted-foreground">
                Lightning-fast gesture recognition with temporal consistency checking
              </p>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardContent className="p-4 text-center">
              <Target className="h-8 w-8 text-accent mx-auto mb-2" />
              <h3 className="font-semibold text-accent mb-2">High Accuracy</h3>
              <p className="text-sm text-muted-foreground">
                Confidence scoring and smart filtering for reliable translations
              </p>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardContent className="p-4 text-center">
              <Volume2 className="h-8 w-8 text-primary mx-auto mb-2" />
              <h3 className="font-semibold text-primary mb-2">Learn & Practice</h3>
              <p className="text-sm text-muted-foreground">
                Interactive learning with detailed instructions and visual guides
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SignLanguageTranslator;
