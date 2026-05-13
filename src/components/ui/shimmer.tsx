export default function Shimmer({ className = '', style = {} }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div className={"shimmer-root " + className} style={style}>
      <style jsx>{`
        .shimmer-root {
          position: relative;
          overflow: hidden;
          background: linear-gradient(90deg, #f3f4f6, #e9eef5);
          border-radius: 8px;
        }
        .shimmer-root::after {
          content: '';
          position: absolute;
          top: 0;
          left: -150%;
          height: 100%;
          width: 200%;
          background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.6) 50%, rgba(255,255,255,0) 100%);
          transform: skewX(-10deg);
          animation: shimmer-move 1.2s ease-in-out infinite;
        }
        @keyframes shimmer-move {
          0% { transform: translateX(-150%) skewX(-10deg); }
          100% { transform: translateX(150%) skewX(-10deg); }
        }
      `}</style>
    </div>
  );
}
