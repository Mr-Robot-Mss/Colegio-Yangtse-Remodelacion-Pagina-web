export class UserInputError extends Error {}
export class ConflictError extends UserInputError {
  constructor() { super("Este contenido cambió en otra pestaña. Recarga la página antes de guardar para no sobrescribir esos cambios."); }
}

