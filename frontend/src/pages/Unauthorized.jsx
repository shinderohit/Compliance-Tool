export default function Unauthorized() {
  return (
    <div className="h-screen flex items-center justify-center bg-background min-h-screen text-primary">
      <div className="text-center">
        <h1 className="text-6xl font-bold">403</h1>

        <p className="text-2xl mt-4">Unauthorized Access</p>
      </div>
    </div>
  );
}
