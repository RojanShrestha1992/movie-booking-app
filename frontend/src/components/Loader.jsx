const Loader = ({ label = 'Loading...' }) => {
  return (
    <div className="mx-auto flex min-h-[40vh] w-full max-w-xl flex-col items-center justify-center gap-3 px-4">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand.ember border-t-transparent" />
      <p className="text-sm font-medium text-slate-600">{label}</p>
    </div>
  );
};

export default Loader;
