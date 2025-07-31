
  
export interface NotifState {
    notifications: {
        id:string;
        title: string;
        text: string;
        hide: boolean;
    }[];
}
