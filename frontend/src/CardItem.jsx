export function CardItem({ imageUrl, name }) {
  return (
    <div className="w-64  h-54 flex items-center justify-center border border-solid border-stone-700 flex-col">
      <img src={imageUrl} alt={name} className="p-2"></img>
      <h4>{name}</h4>
    </div>
  );
}
