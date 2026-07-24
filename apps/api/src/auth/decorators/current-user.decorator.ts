import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { SafeUser } from "../types/auth-response";

export const CurrentUser = createParamDecorator((_: unknown, context: ExecutionContext): SafeUser => {
  const request = context.switchToHttp().getRequest<{ user: SafeUser }>();
  return request.user;
});
