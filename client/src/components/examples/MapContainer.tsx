import MapContainer from '../MapContainer';

export default function MapContainerExample() {
  return (
    <MapContainer 
      onLocationChange={(location) => {
        console.log('Location changed:', location);
      }}
    />
  );
}
