import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Matches } from 'class-validator';

export class RegisterDomainDto {
  @ApiProperty({
    description: '서브도메인 이름',
    example: 'blog'
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z0-9-]+$/, {
    message: '서브도메인은 소문자, 숫자, 하이픈만 포함할 수 있습니다'
  })
  subdomain: string;
}
