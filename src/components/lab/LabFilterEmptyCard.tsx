type Props = {
  message: string;
};

/** Card a pantalla restante cuando un filtro no tiene resultados. */
export function LabFilterEmptyCard({ message }: Props) {
  return (
    <div className="lab-bento__card lab-bento__card--empty">
      <p className="lab-bento__empty-message">{message}</p>
    </div>
  );
}
