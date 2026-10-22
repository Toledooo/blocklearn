// Campo de texto com o rótulo "encaixado" na borda, como no design do Figma.
export default function TextField({ label, ...inputProps }) {
  return (
    <label className="relative block">
      <span className="absolute -top-[9px] left-3 bg-black px-1 font-mono text-[15px] font-bold text-neon">
        {label}
      </span>
      <input
        autoComplete="off"
        {...inputProps}
        className="min-h-11 w-full rounded-[10px] border-2 border-[#888] bg-transparent px-3 py-1 font-mono text-xl text-white placeholder:text-zinc-500 focus:border-neon focus:outline-none sm:text-2xl"
      />
    </label>
  )
}
