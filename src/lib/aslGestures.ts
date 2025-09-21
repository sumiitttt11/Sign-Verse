// Enhanced ASL gesture database with more comprehensive recognition
export interface ASLGesture {
  id: string;
  name: string;
  description: string;
  category: 'letter' | 'word' | 'phrase';
  landmarks: number[][];
  confidence_threshold: number;
}

export const ASL_GESTURES: ASLGesture[] = [
  {
    id: 'a',
    name: 'A',
    description: 'Closed fist with thumb resting against the side',
    category: 'letter',
    landmarks: [],
    confidence_threshold: 0.8
  },
  {
    id: 'b',
    name: 'B',
    description: 'Open palm with thumb folded across palm',
    category: 'letter',
    landmarks: [],
    confidence_threshold: 0.8
  },
  {
    id: 'c',
    name: 'C',
    description: 'Curved hand forming a C shape',
    category: 'letter',
    landmarks: [],
    confidence_threshold: 0.75
  },
  {
    id: 'd',
    name: 'D',
    description: 'Index finger pointing up, other fingers folded',
    category: 'letter',
    landmarks: [],
    confidence_threshold: 0.8
  },
  {
    id: 'e',
    name: 'E',
    description: 'All fingers curled with fingertips touching thumb',
    category: 'letter',
    landmarks: [],
    confidence_threshold: 0.75
  },
  {
    id: 'hello',
    name: 'Hello',
    description: 'Open palm waving motion',
    category: 'word',
    landmarks: [],
    confidence_threshold: 0.7
  },
  {
    id: 'please',
    name: 'Please',
    description: 'Open palm circling on chest',
    category: 'word',
    landmarks: [],
    confidence_threshold: 0.7
  },
  {
    id: 'thank_you',
    name: 'Thank You',
    description: 'Fingertips touch lips then move forward',
    category: 'word',
    landmarks: [],
    confidence_threshold: 0.7
  },
  {
    id: 'yes',
    name: 'Yes',
    description: 'Fist nodding up and down',
    category: 'word',
    landmarks: [],
    confidence_threshold: 0.75
  },
  {
    id: 'no',
    name: 'No',
    description: 'Index and middle finger tapping thumb',
    category: 'word',
    landmarks: [],
    confidence_threshold: 0.75
  },
  {
    id: 'sorry',
    name: 'Sorry',
    description: 'Fist circling on chest',
    category: 'word',
    landmarks: [],
    confidence_threshold: 0.7
  },
  {
    id: 'help',
    name: 'Help',
    description: 'One hand supporting the other',
    category: 'word',
    landmarks: [],
    confidence_threshold: 0.7
  }
];

export const SIGN_DESCRIPTIONS: { [key: string]: string } = {
  'a': 'Make a fist with your thumb resting against the side of your index finger.',
  'b': 'Hold your hand up with palm facing out, fingers straight up, thumb folded across your palm.',
  'c': 'Curve your hand into a C shape, as if holding a small cup.',
  'd': 'Point your index finger straight up, fold other fingers down, thumb touching middle finger.',
  'e': 'Curl all your fingers so fingertips touch your thumb, forming a closed fist.',
  'f': 'Touch your thumb to your index finger, other fingers straight up.',
  'g': 'Point your index finger and thumb horizontally, other fingers folded.',
  'h': 'Extend index and middle fingers horizontally, other fingers folded.',
  'i': 'Extend your pinky finger up, other fingers folded, thumb across fingers.',
  'j': 'Make the letter I, then trace a J shape in the air.',
  'k': 'Extend index and middle fingers upward in a V, thumb between them.',
  'l': 'Extend index finger up and thumb out, forming an L shape.',
  'm': 'Place thumb under your first three fingers.',
  'n': 'Place thumb under your first two fingers.',
  'o': 'Curve all fingers to form an O shape.',
  'p': 'Make the letter K but point it downward.',
  'q': 'Point index finger and thumb down, forming a G upside down.',
  'r': 'Cross your index and middle fingers.',
  's': 'Make a fist with thumb across your fingers.',
  't': 'Place thumb between index and middle finger.',
  'u': 'Extend index and middle fingers upward, touching.',
  'v': 'Extend index and middle fingers upward in a V shape.',
  'w': 'Extend index, middle, and ring fingers upward.',
  'x': 'Curve your index finger into a hook shape.',
  'y': 'Extend thumb and pinky, fold other fingers.',
  'z': 'Trace the letter Z in the air with your index finger.',
  'hello': 'Wave with an open palm, fingers slightly spread.',
  'please': 'Place open palm on chest and move in a circular motion.',
  'thank you': 'Touch fingertips to lips, then move hand forward toward the person.',
  'yes': 'Make a fist and nod it up and down like a head nodding.',
  'no': 'Tap index and middle finger against thumb repeatedly.',
  'sorry': 'Make a fist and circle it on your chest.',
  'help': 'Place one fist on top of the other palm, lift both hands together.',
  'love': 'Cross both hands over your chest.',
  'family': 'Make F handshapes with both hands, circle them around each other.',
  'friend': 'Hook index fingers together, then flip and hook again.',
  'water': 'Make W handshape and tap it against your chin.',
  'food': 'Touch fingertips to lips repeatedly.',
  'more': 'Touch fingertips of both hands together repeatedly.',
  'finished': 'Hold both hands up with palms facing out, then flip them down.'
};