import { FastifyRequest } from "fastify";

export function GetRequestIpAndUrl(request: FastifyRequest) {
  const forwarded = request.headers["x-forwarded-for"];
  const request_ip = forwarded
    ? forwarded.toString().split(",")[0].trim()
    : request.ip;
  const request_url = `${request.protocol}://${request.hostname}${request.raw.url}`;

  return { request_ip, request_url };
}
