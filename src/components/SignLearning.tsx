import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Book, Image as ImageIcon, Type } from 'lucide-react';
import { SIGN_DESCRIPTIONS } from '@/lib/aslGestures';
import { Camera, CameraOff, Mic, MicOff, Volume2, VolumeX, Brain, Zap, Target } from 'lucide-react';

interface SignLearningProps {
  onGestureGenerated?: (gesture: string) => void;
}

const SignLearning: React.FC<SignLearningProps> = ({ onGestureGenerated }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSign, setSelectedSign] = useState<string | null>(null);
  const [showDescription, setShowDescription] = useState(true);

  const handleSearch = (query: string) => {
    setSearchQuery(query.toLowerCase());
  };

  const filteredSigns = Object.keys(SIGN_DESCRIPTIONS).filter(sign =>
    sign.toLowerCase().includes(searchQuery) ||
    SIGN_DESCRIPTIONS[sign].toLowerCase().includes(searchQuery)
  );

  const generateSignImage = async (sign: string) => {
    onGestureGenerated?.(sign);
  };

  const commonPhrases = [
    'hello', 'thank you', 'please', 'sorry', 'help', 'yes', 'no',
    'good morning', 'good night', 'how are you', 'nice to meet you'
  ];

  const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');

  return (
    <div className="min-h-screen p-64 pt-40 space-y-6"> {/* ⬅️ Added space-y-6 to separate sections */}
      {/* Main Learning Card */}
      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Book className="h-5 w-5" />
            Learn Sign Language
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search for a word or letter to learn..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Quick Access Categories */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">Common Phrases</h3>
              <div className="flex flex-wrap gap-2">
                {commonPhrases.slice(0, 8).map((phrase) => (
                  <Badge
                    key={phrase}
                    variant="outline"
                    className="cursor-pointer hover:bg-primary/10 hover:border-primary/50"
                    onClick={() => setSelectedSign(phrase)}
                  >
                    {phrase}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">Alphabet</h3>
              <div className="grid grid-cols-6 gap-2">
                {alphabet.slice(0, 12).map((letter) => (
                  <Badge
                    key={letter}
                    variant="outline"
                    className="cursor-pointer hover:bg-secondary/10 hover:border-secondary/50 text-center justify-center"
                    onClick={() => setSelectedSign(letter)}
                  >
                    {letter.toUpperCase()}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Search Results */}
          {searchQuery && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground">Search Results</h3>
              <div className="max-h-40 overflow-y-auto space-y-1">
                {filteredSigns.map((sign) => (
                  <div
                    key={sign}
                    className="p-2 rounded-lg border cursor-pointer hover:bg-accent/10 hover:border-accent/50"
                    onClick={() => setSelectedSign(sign)}
                  >
                    <span className="font-medium capitalize">{sign.replace('_', ' ')}</span>
                  </div>
                ))}
                {filteredSigns.length === 0 && (
                  <p className="text-muted-foreground text-sm italic">
                    No signs found for "{searchQuery}"
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Selected Sign Details */}
          {selectedSign && (
            <div className="space-y-4 p-4 bg-muted/30 rounded-lg border">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold capitalize text-primary">
                  {selectedSign.replace('_', ' ')}
                </h3>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDescription(!showDescription)}
                  >
                    <Type className="h-4 w-4 mr-1" />
                    {showDescription ? 'Hide' : 'Show'} Description
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => generateSignImage(selectedSign)}
                  >
                    <ImageIcon className="h-4 w-4 mr-1" />
                    Generate Image
                  </Button>
                </div>
              </div>

              {showDescription && SIGN_DESCRIPTIONS[selectedSign] && (
                <div className="p-3 bg-background/50 rounded-lg">
                  <p className="text-sm leading-relaxed">
                    {SIGN_DESCRIPTIONS[selectedSign]}
                  </p>
                </div>
              )}

              {/* Practice Tips */}
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Practice Tips:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Practice slowly and clearly</li>
                  <li>• Use your dominant hand unless specified</li>
                  <li>• Maintain natural facial expressions</li>
                  <li>• Practice in front of a mirror</li>
                </ul>
              </div>
            </div>
          )}

          {/* Learning Progress */}
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Available Signs:</span>
              <span className="font-medium">{Object.keys(SIGN_DESCRIPTIONS).length} signs</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feature Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass h-full">
          <CardContent className="p-4 text-center">
            <Brain className="h-8 w-8 text-primary mx-auto mb-2" />
            <h3 className="font-semibold text-primary mb-2">Multi-Algorithm AI</h3>
            <p className="text-sm text-muted-foreground">
              Advanced computer vision with multiple recognition approaches for maximum accuracy
            </p>
          </CardContent>
        </Card>
        <Card className="glass h-full">
          <CardContent className="p-4 text-center">
            <Zap className="h-8 w-8 text-secondary mx-auto mb-2" />
            <h3 className="font-semibold text-secondary mb-2">Real-time Processing</h3>
            <p className="text-sm text-muted-foreground">
              Lightning-fast gesture recognition with temporal consistency checking
            </p>
          </CardContent>
        </Card>
        <Card className="glass h-full">
          <CardContent className="p-4 text-center">
            <Target className="h-8 w-8 text-accent mx-auto mb-2" />
            <h3 className="font-semibold text-accent mb-2">High Accuracy</h3>
            <p className="text-sm text-muted-foreground">
              Confidence scoring and smart filtering for reliable translations
            </p>
          </CardContent>
        </Card>
        <Card className="glass h-full">
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
  );
};

export default SignLearning;
