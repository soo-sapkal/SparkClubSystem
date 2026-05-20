export default function LoadingSpinner({ size = 24 }) {
  return (
    <div className="flex items-center justify-center p-8">
      <div
        style={{ width: size, height: size }}
        className="border-2 border-spark-500/30 border-t-spark-500 rounded-full animate-spin"
      />
    </div>
  );
}