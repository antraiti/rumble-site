interface ColorStatProps {
  name: string;
  playcount: number;
  winrate: string;
  imgname: string;
}

/** Single color-identity stat tile (icon + play count + winrate) used across stats pages. */
export default function ColorStat({ name, playcount, winrate, imgname }: ColorStatProps) {
  return (
    <div>
      <div className="flex flex-col shadow-xl">
        <div className="flex justify-evenly">
          <img className="h-8 w-8 self-center" src={`/${imgname}`} alt={name} />
          <div className="text-5xl font-bold">{playcount}</div>
        </div>
        <div className="stat">
          <div className="stat-title">Winrate</div>
          <div className="stat-value">{winrate}</div>
        </div>
      </div>
    </div>
  );
}
