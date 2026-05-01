export function CircuitPattern({ opacity = "opacity-15" }: { opacity?: string }) {
  return (
    <svg className={`absolute inset-0 w-full h-full ${opacity} pointer-events-none`} xmlns="http://www.w3.org/2000/svg">
      <defs>
        {/* Circuit board pattern */}
        <pattern id="circuit-pattern" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
          {/* Horizontal lines */}
          <path d="M0,40 L60,40 M80,40 L140,40" stroke="currentColor" strokeWidth="1.5" fill="none" />
          <path d="M0,100 L40,100 M60,100 L200,100" stroke="currentColor" strokeWidth="1.5" fill="none" />
          <path d="M0,160 L100,160 M120,160 L200,160" stroke="currentColor" strokeWidth="1.5" fill="none" />
          
          {/* Vertical lines */}
          <path d="M60,0 L60,40 M60,100 L60,140" stroke="currentColor" strokeWidth="1.5" fill="none" />
          <path d="M120,0 L120,80 M120,160 L120,200" stroke="currentColor" strokeWidth="1.5" fill="none" />
          <path d="M180,20 L180,120" stroke="currentColor" strokeWidth="1.5" fill="none" />
          
          {/* Circuit nodes */}
          <circle cx="60" cy="40" r="3" fill="currentColor" />
          <circle cx="60" cy="100" r="3" fill="currentColor" />
          <circle cx="120" cy="160" r="3" fill="currentColor" />
          <circle cx="40" cy="100" r="2" fill="currentColor" />
          <circle cx="100" cy="160" r="2" fill="currentColor" />
          <circle cx="140" cy="40" r="2" fill="currentColor" />
          
          {/* Small traces */}
          <path d="M180,60 L160,60 L160,80 L140,80" stroke="currentColor" strokeWidth="1" fill="none" />
          <path d="M20,160 L20,180 L40,180" stroke="currentColor" strokeWidth="1" fill="none" />
        </pattern>
        
        {/* Contour/topographic lines pattern */}
        <pattern id="contour-pattern" x="0" y="0" width="300" height="300" patternUnits="userSpaceOnUse">
          {/* Curved contour lines */}
          <path d="M0,50 Q75,45 150,50 T300,50" stroke="currentColor" strokeWidth="0.5" fill="none" opacity="0.4" />
          <path d="M0,80 Q75,75 150,80 T300,80" stroke="currentColor" strokeWidth="0.5" fill="none" opacity="0.4" />
          <path d="M0,150 Q75,145 150,150 T300,150" stroke="currentColor" strokeWidth="0.5" fill="none" opacity="0.5" />
          <path d="M0,180 Q75,175 150,180 T300,180" stroke="currentColor" strokeWidth="0.5" fill="none" opacity="0.4" />
          <path d="M0,250 Q75,245 150,250 T300,250" stroke="currentColor" strokeWidth="0.5" fill="none" opacity="0.3" />
        </pattern>
      </defs>
      
      {/* Apply patterns */}
      <rect width="100%" height="100%" fill="url(#circuit-pattern)" />
      <rect width="100%" height="100%" fill="url(#contour-pattern)" />
    </svg>
  );
}
