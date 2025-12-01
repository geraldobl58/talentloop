import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

/**
 * Custom validator que permite URLs normais e localhost para desenvolvimento
 */
@ValidatorConstraint({ name: 'isUrlOrLocalhost', async: false })
export class IsUrlOrLocalhostConstraint
  implements ValidatorConstraintInterface
{
  validate(url: string) {
    if (!url) return true; // opcional

    // Permitir URLs localhost em desenvolvimento
    if (
      url.startsWith('http://localhost:') ||
      url.startsWith('https://localhost:')
    ) {
      return true;
    }

    // Validar URLs normais
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  defaultMessage() {
    return 'URL deve ser válida (incluindo http://localhost: para desenvolvimento)';
  }
}
