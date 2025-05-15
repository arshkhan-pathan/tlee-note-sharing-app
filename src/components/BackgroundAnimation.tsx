import React from 'react'

const DarkMovingGradientBackground: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div style={styles.container}>
      {children}
      <style jsx>{`
        @keyframes gradientShift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>
    </div>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    position: 'relative',
    height: '100vh',
    width: '100vw',
    overflow: 'hidden',
    background: `linear-gradient(270deg, #0f2027, #203a43, #2c5364, #1e2a38)`, // dark blues & greys
    backgroundSize: '800% 800%',
    animation: 'gradientShift 10s ease infinite',
    color: '#f0f0f0', // for any text inside
  },
}

export default DarkMovingGradientBackground
