export const fetchSubgraph = async (query: string) => fetch(import.meta.env.VITE_SUBGRAPH_URL, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ query }),
});

export const parseSubgraphResponse = async (response: Response) => {
  if (!response.ok) {
    throw new Error(`Subgraph query failed with status ${response.status}`);
  }  
  return response.json();   
};

export const querySubgraph = async (query: string) => {
  const response = await fetchSubgraph(query);
  return parseSubgraphResponse(response);
};

export const getPolls = async () => {
    const query = ` 
    {
      pollCreateds {
        pollId
        merkleRoot
      }
    }
    `;

    const data = await querySubgraph(query);
    return data.data.pollCreateds;
}