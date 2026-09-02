function redirectToAwardee(request: Request) {
  return Response.redirect(new URL('/#awardee', request.url), 308);
}

export function GET(request: Request) {
  return redirectToAwardee(request);
}

export function HEAD(request: Request) {
  return redirectToAwardee(request);
}
