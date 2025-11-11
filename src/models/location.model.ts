export interface Country {
  id: number;
  name: string;
}
export interface State {
  id: number;
  countryId: number;
  name: string;
}
export interface City {
  id: number;
  stateId: number;
  name: string;
}
