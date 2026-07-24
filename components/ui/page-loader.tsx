export function PageLoader() {
  return (
    <div className="game-pin-background h-screen w-screen bg-no-repeat bg-cover flex justify-center items-center">
      <div className="bg-white/95 rounded-xl border-2 border-slate-800 border-b-[6px] border-r-[6px] py-8 px-10 text-center animate-fadeIn">
        <p className="text-xl font-oldschool text-slate-600 animate-pulse">Hang tight...</p>
      </div>
    </div>
  );
}
