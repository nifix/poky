interface UseApi {
    url: string;
}

export const useApi = () : UseApi => {
    const urlApi: string = "https://api.poky.moocrosoft.dev"
    return {
        url: urlApi
    }
}