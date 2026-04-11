interface UseApi {
    url: string;
}

export const useApi = () : UseApi => {
    const urlApi: string = "http://localhost:5199";
    return {
        url: urlApi
    }
}