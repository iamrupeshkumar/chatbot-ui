import { HttpInterceptorFn } from '@angular/common/http';

export const credentialsInterceptor: HttpInterceptorFn = (req, next) => {

  console.log('Interceptor: Original request URL:', req.url);
  console.log('Interceptor: Original request withCredentials:', req.withCredentials); // This should be undefined or false

  // Clone the request to add the new header.
  const authReq = req.clone({
    withCredentials: true, // Include credentials in the request
  });

  console.log('Interceptor: Cloned request withCredentials:', authReq.withCredentials); // This should be TRUE for every request

  return next(authReq);
};
