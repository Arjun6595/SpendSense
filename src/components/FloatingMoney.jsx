import { useEffect, useState } from 'react'

const FloatingMoney = ({ topOffset = 0 }) => {
  const [moneyElements, setMoneyElements] = useState([])

  useEffect(() => {
    // Create floating money elements
    const elements = []
    for (let i = 0; i < 15; i++) {
      elements.push({
        id: i,
        left: Math.random() * 100,
        top: topOffset + Math.random() * (100 - topOffset),
        rotation: Math.random() * 360,
        scale: 0.5 + Math.random() * 0.5,
        animationDelay: Math.random() * 10,
        animationDuration: 15 + Math.random() * 10
      })
    }
    setMoneyElements(elements)
  }, [])

  return (
    <div
      className="fixed inset-0 pointer-events-none -z-50 overflow-hidden"
      style={{
        WebkitMaskImage: `linear-gradient(to bottom, transparent 0%, transparent ${topOffset}%, black ${topOffset}%, black 100%)`,
        maskImage: `linear-gradient(to bottom, transparent 0%, transparent ${topOffset}%, black ${topOffset}%, black 100%)`,
      }}
    >
      {moneyElements.map((element) => (
        <div
          key={element.id}
          className="absolute opacity-10"
          style={{
            left: `${element.left}%`,
            top: `${element.top}%`,
            transform: `rotate(${element.rotation}deg) scale(${element.scale})`,
            animation: `floatMoney ${element.animationDuration}s ease-in-out infinite`,
            animationDelay: `${element.animationDelay}s`
          }}
        >
          <svg
            width="60"
            height="40"
            viewBox="0 0 60 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              x="2"
              y="2"
              width="56"
              height="36"
              rx="4"
              fill="#2d5a2d"
              stroke="#1a4d1a"
              strokeWidth="2"
            />
            <circle cx="30" cy="20" r="10" fill="#4a7c4a" />
            <text
              x="30"
              y="26"
              textAnchor="middle"
              fontSize="12"
              fontWeight="bold"
              fill="#ffffff"
            >
              $
            </text>
            <rect x="8" y="8" width="4" height="2" rx="1" fill="#4a7c4a" />
            <rect x="8" y="12" width="6" height="2" rx="1" fill="#4a7c4a" />
            <rect x="48" y="8" width="4" height="2" rx="1" fill="#4a7c4a" />
            <rect x="46" y="12" width="6" height="2" rx="1" fill="#4a7c4a" />
            <rect x="8" y="28" width="4" height="2" rx="1" fill="#4a7c4a" />
            <rect x="8" y="32" width="6" height="2" rx="1" fill="#4a7c4a" />
            <rect x="48" y="28" width="4" height="2" rx="1" fill="#4a7c4a" />
            <rect x="46" y="32" width="6" height="2" rx="1" fill="#4a7c4a" />
          </svg>
        </div>
      ))}
      
      {/* Additional coin elements */}
      {Array.from({ length: 8 }, (_, i) => (
        <div
          key={`coin-${i}`}
          className="absolute opacity-8"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${topOffset + Math.random() * (100 - topOffset)}%`,
            animation: `floatMoney ${20 + Math.random() * 15}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 8}s`
          }}
        >
          <svg
            width="30"
            height="30"
            viewBox="0 0 30 30"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="15" cy="15" r="13" fill="#f4d03f" stroke="#f1c40f" strokeWidth="2" />
            <text
              x="15"
              y="20"
              textAnchor="middle"
              fontSize="14"
              fontWeight="bold"
              fill="#d68910"
            >
              $
            </text>
          </svg>
        </div>
      ))}
    </div>
  )
}

export default FloatingMoney