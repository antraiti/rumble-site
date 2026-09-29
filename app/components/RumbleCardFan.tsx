import Image from 'next/image'

type RumbleCardFanProps = {
  priority?: boolean
  className?: string
}

export default function RumbleCardFan({ priority = false, className = '' }: RumbleCardFanProps) {
  return (
    <div
      role="img"
      aria-label="Three Rumble cards fanned out"
      className={`relative h-64 w-72 rotate-[8deg] sm:h-72 sm:w-80 ${className}`}
    >
      <div className="absolute left-[46%] top-1/2 z-10 flex h-52 w-36 -translate-x-1/2 -translate-y-1/2 rotate-[-3deg] items-center justify-center overflow-hidden rounded-lg border border-white/20 bg-[#111b24] shadow-2xl sm:h-56 sm:w-40">
        <Image src="/newlogo.svg" alt="" width={112} height={112} className="size-28 sm:size-32" />
      </div>
      <div className="absolute left-[54%] top-1/2 z-30 flex h-52 w-36 -translate-x-1/2 -translate-y-1/2 rotate-[3deg] items-center justify-center overflow-hidden rounded-lg border border-white/20 bg-[#111b24] shadow-2xl sm:h-56 sm:w-40">
        <Image src="/newlogo.svg" alt="" width={112} height={112} className="size-28 sm:size-32" />
      </div>
      <div className="absolute left-1/2 top-1/2 z-20 flex h-52 w-36 -translate-x-1/2 -translate-y-1/2 items-center justify-center overflow-hidden rounded-lg border border-white/20 bg-[#111b24] shadow-2xl sm:h-56 sm:w-40">
        <Image src="/newlogo.svg" alt="" width={112} height={112} priority={priority} className="size-28 sm:size-32" />
      </div>
    </div>
  )
}