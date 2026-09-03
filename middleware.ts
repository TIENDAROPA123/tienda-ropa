import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const basicAuth = req.headers.get('authorization');

  // Puedes cambiar el usuario y la contraseña por los que prefieras
  const ADMIN_USER = process.env.ADMIN_USER || 'admin';
  const ADMIN_PASS = process.env.ADMIN_PASSWORD || 'tienda2026';

  if (basicAuth) {
    const authValue = basicAuth.split(' ')[1];
    const [user, pwd] = atob(authValue).split(':');

    if (user === ADMIN_USER && pwd === ADMIN_PASS) {
      return NextResponse.next();
    }
  }

  // Si no está autenticado, el navegador muestra la ventana de inicio de sesión
  return new NextResponse('Acceso no autorizado', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Panel de Administracion"',
    },
  });
}

// Se aplica únicamente a las rutas de administración
export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};