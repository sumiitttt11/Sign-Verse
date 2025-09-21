interface HandLandmark {
  x: number;
  y: number;
  z: number;
}

export class AdvancedGestureRecognizer {
  private gestureHistory: Array<{ gesture: string; confidence: number; timestamp: number }> = [];
  private readonly HISTORY_SIZE = 10;
  private readonly MIN_CONSISTENCY = 3;

  // Enhanced gesture recognition with multiple detection algorithms
  recognizeGesture(landmarks: HandLandmark[]): { gesture: string; confidence: number } | null {
    if (!landmarks || landmarks.length !== 21) return null;

    // Multiple recognition approaches
    const results = [
      this.recognizeByFingerPositions(landmarks),
      this.recognizeByAngles(landmarks),
      this.recognizeByDistances(landmarks),
      this.recognizeByHandShape(landmarks)
    ].filter(Boolean);

    if (results.length === 0) return null;

    // Weighted voting system
    const gestureVotes: { [key: string]: { count: number; totalConfidence: number } } = {};
    
    results.forEach(result => {
      if (!gestureVotes[result!.gesture]) {
        gestureVotes[result!.gesture] = { count: 0, totalConfidence: 0 };
      }
      gestureVotes[result!.gesture].count++;
      gestureVotes[result!.gesture].totalConfidence += result!.confidence;
    });

    // Find best gesture
    let bestGesture = '';
    let bestScore = 0;

    Object.entries(gestureVotes).forEach(([gesture, data]) => {
      const avgConfidence = data.totalConfidence / data.count;
      const score = avgConfidence * (data.count / results.length);
      
      if (score > bestScore) {
        bestScore = score;
        bestGesture = gesture;
      }
    });

    if (bestScore < 0.6) return null;

    // Add temporal consistency check
    const finalResult = this.addTemporalConsistency(bestGesture, bestScore);
    return finalResult;
  }

  private recognizeByFingerPositions(landmarks: HandLandmark[]): { gesture: string; confidence: number } | null {
    const fingerTips = [4, 8, 12, 16, 20]; // Thumb, Index, Middle, Ring, Pinky tips
    const fingerMCPs = [2, 5, 9, 13, 17]; // Metacarpophalangeal joints

    // Check which fingers are extended
    const extendedFingers = fingerTips.map((tip, index) => {
      const tipY = landmarks[tip].y;
      const mcpY = landmarks[fingerMCPs[index]].y;
      return tipY < mcpY; // Finger is up if tip is above MCP
    });

    // Specific gesture patterns
    const patterns = {
      'A': [false, false, false, false, false], // Closed fist
      'B': [false, true, true, true, true],     // Open palm, thumb folded
      'D': [false, true, false, false, false],  // Index finger up
      'F': [true, true, false, false, false],   // Thumb and index touching
      'I': [false, false, false, false, true],  // Pinky up
      'L': [true, true, false, false, false],   // Thumb and index forming L
      'V': [false, true, true, false, false],   // Peace sign
      'W': [false, true, true, true, false],    // Three fingers up
      'Y': [true, false, false, false, true],   // Thumb and pinky out
    };

    for (const [gesture, pattern] of Object.entries(patterns)) {
      if (this.arraysMatch(extendedFingers, pattern)) {
        return { gesture, confidence: 0.85 };
      }
    }

    return null;
  }

  private recognizeByAngles(landmarks: HandLandmark[]): { gesture: string; confidence: number } | null {
    // Calculate angles between finger segments
    const calculateAngle = (p1: HandLandmark, p2: HandLandmark, p3: HandLandmark): number => {
      const v1 = { x: p1.x - p2.x, y: p1.y - p2.y };
      const v2 = { x: p3.x - p2.x, y: p3.y - p2.y };
      
      const dot = v1.x * v2.x + v1.y * v2.y;
      const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
      const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);
      
      return Math.acos(dot / (mag1 * mag2)) * 180 / Math.PI;
    };

    // Check specific angle patterns for gestures
    const thumbAngle = calculateAngle(landmarks[2], landmarks[3], landmarks[4]);
    const indexAngle = calculateAngle(landmarks[6], landmarks[7], landmarks[8]);

    // C gesture - curved fingers
    if (thumbAngle > 45 && thumbAngle < 90 && indexAngle > 45 && indexAngle < 90) {
      return { gesture: 'C', confidence: 0.75 };
    }

    // O gesture - all fingers curved in circle
    const allCurved = [8, 12, 16, 20].every(tip => {
      const angle = calculateAngle(landmarks[tip-2], landmarks[tip-1], landmarks[tip]);
      return angle > 30 && angle < 120;
    });

    if (allCurved) {
      return { gesture: 'O', confidence: 0.8 };
    }

    return null;
  }

  private recognizeByDistances(landmarks: HandLandmark[]): { gesture: string; confidence: number } | null {
    const distance = (p1: HandLandmark, p2: HandLandmark): number => {
      return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
    };

    // Thumb-index distance for specific gestures
    const thumbTip = landmarks[4];
    const indexTip = landmarks[8];
    const thumbIndexDist = distance(thumbTip, indexTip);

    // F gesture - thumb and index touching
    if (thumbIndexDist < 0.05) {
      return { gesture: 'F', confidence: 0.9 };
    }

    // OK gesture - thumb and index forming circle
    if (thumbIndexDist < 0.08 && thumbIndexDist > 0.02) {
      const middleTip = landmarks[12];
      const ringTip = landmarks[16];
      const pinkyTip = landmarks[20];
      const wrist = landmarks[0];

      // Check if other fingers are extended upward
      if (middleTip.y < wrist.y && ringTip.y < wrist.y && pinkyTip.y < wrist.y) {
        return { gesture: 'OK', confidence: 0.85 };
      }
    }

    return null;
  }

  private recognizeByHandShape(landmarks: HandLandmark[]): { gesture: string; confidence: number } | null {
    // Overall hand shape analysis
    const wrist = landmarks[0];
    const fingertips = [4, 8, 12, 16, 20];
    
    // Calculate hand openness
    const avgDistanceFromWrist = fingertips.reduce((sum, tip) => {
      const dist = Math.sqrt((landmarks[tip].x - wrist.x) ** 2 + (landmarks[tip].y - wrist.y) ** 2);
      return sum + dist;
    }, 0) / fingertips.length;

    // Hand orientation
    const palmCenter = landmarks[9]; // Middle finger MCP
    const handDirection = Math.atan2(palmCenter.y - wrist.y, palmCenter.x - wrist.x);

    // Gesture recognition based on overall shape
    if (avgDistanceFromWrist < 0.15) {
      // Closed hand gestures
      const thumbPos = landmarks[4];
      if (thumbPos.x > palmCenter.x) {
        return { gesture: 'S', confidence: 0.8 }; // S or closed fist
      }
    }

    // Wave gesture - detecting motion would require temporal data
    // For now, detect open palm
    if (avgDistanceFromWrist > 0.25) {
      return { gesture: 'Hello', confidence: 0.7 };
    }

    return null;
  }

  private addTemporalConsistency(gesture: string, confidence: number): { gesture: string; confidence: number } | null {
    const now = Date.now();
    
    // Add current detection to history
    this.gestureHistory.push({ gesture, confidence, timestamp: now });
    
    // Keep only recent history
    this.gestureHistory = this.gestureHistory.filter(entry => now - entry.timestamp < 2000);
    
    if (this.gestureHistory.length > this.HISTORY_SIZE) {
      this.gestureHistory.shift();
    }

    // Count consistent detections
    const recentSameGestures = this.gestureHistory.filter(entry => 
      entry.gesture === gesture && now - entry.timestamp < 1000
    );

    if (recentSameGestures.length >= this.MIN_CONSISTENCY) {
      const avgConfidence = recentSameGestures.reduce((sum, entry) => sum + entry.confidence, 0) / recentSameGestures.length;
      return { gesture, confidence: Math.min(avgConfidence * 1.1, 0.95) };
    }

    return null;
  }

  private arraysMatch(arr1: boolean[], arr2: boolean[]): boolean {
    return arr1.length === arr2.length && arr1.every((val, index) => val === arr2[index]);
  }

  // Advanced word recognition using gesture sequences
  recognizeWordSequence(recentGestures: string[]): string | null {
    const sequences = {
      'hello': ['H', 'E', 'L', 'L', 'O'],
      'thank you': ['T', 'H', 'A', 'N', 'K'],
      'please': ['P', 'L', 'E', 'A', 'S', 'E'],
      'sorry': ['S', 'O', 'R', 'R', 'Y'],
    };

    for (const [word, sequence] of Object.entries(sequences)) {
      if (this.sequenceMatches(recentGestures, sequence)) {
        return word;
      }
    }

    return null;
  }

  private sequenceMatches(recent: string[], target: string[]): boolean {
    if (recent.length < target.length) return false;
    
    const recentEnd = recent.slice(-target.length);
    return recentEnd.every((gesture, index) => gesture === target[index]);
  }
}
