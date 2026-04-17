/**
 * Language config — future multi-language support.
 */
export const LANGUAGES = [
  { 
    id: 'c',    
    name: 'C',        
    icon: 'C', 
    active: true,
    extension: 'c',
    starterCode: '#include <stdio.h>\n\nint main() {\n    // Ваш код тут\n    return 0;\n}'
  },
  { 
    id: 'cpp',    
    name: 'C++',        
    icon: '⧫', 
    active: true,
    extension: 'cpp',
    starterCode: '#include <iostream>\nusing namespace std;\n\nint main() {\n    // Ваш код тут\n    return 0;\n}'
  },
  { 
    id: 'python', 
    name: 'Python',     
    icon: '◆', 
    active: false,
    comingSoon: true,
    extension: 'py',
    starterCode: '# Ваш код тут\n'
  },
  { 
    id: 'js',     
    name: 'JavaScript', 
    icon: '◈', 
    active: false,
    comingSoon: true,
    extension: 'js',
    starterCode: '// Ваш код тут\n'
  },
  { 
    id: 'rust',   
    name: 'Rust',       
    icon: '◇', 
    active: false, 
    comingSoon: true,
    extension: 'rs',
    starterCode: 'fn main() {\n    // Ваш код тут\n}'
  },
];

export function getActiveLanguage() {
  return LANGUAGES.find(l => l.active) || LANGUAGES[0];
}

export function getLanguageConfig(id) {
  return LANGUAGES.find(l => l.id === id) || LANGUAGES[0];
}
