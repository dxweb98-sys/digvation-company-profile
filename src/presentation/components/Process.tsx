import { ChatCircleDotsIcon, SquaresFourIcon, HandshakeIcon } from '@phosphor-icons/react';
import { useContent } from '../context';
export function Process({ compact = false }: { compact?: boolean }) {
  const { t } = useContent();
  const icons = [
    <ChatCircleDotsIcon size={26} />,
    <SquaresFourIcon size={26} />,
    <HandshakeIcon size={26} />,
  ];
  return (
    <ol className={`process-list ${compact ? 'compact-process' : ''}`}>
      {['understand', 'build', 'support'].map((key, i) => (
        <li key={key} data-reveal>
          <span className="process-number">0{i + 1}</span>
          {icons[i]}
          <h3>{t(`process.${key}`)}</h3>
          {!compact && <p>{t(`process.${key}Text`)}</p>}
        </li>
      ))}
    </ol>
  );
}
