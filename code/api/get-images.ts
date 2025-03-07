export const getImages = async (roomId: string, pageSize: number, continuationToken: string | undefined) => {
  let endpoint = `${process.env.NEXT_PUBLIC_API_ENDPOINT}/${process.env.NEXT_PUBLIC_API_ENDPOINT_HUB_NAME}/rooms/${roomId}/images?pageSize=${pageSize}`;
  
  if (continuationToken) {
    endpoint = `${endpoint}&continuationToken=${continuationToken}`;
  }
  
  const response = await fetch(endpoint);
  const data = await response.json();
  return data;
}