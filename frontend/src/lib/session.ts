export type PublicSession =
  | { readonly role: 'admin' }
  | { readonly role: 'user'; readonly rut: string };

export type ScoreConsultation = {
  readonly rut: string;
  readonly score: number;
  readonly fecha: string;
};
