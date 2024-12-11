import { ApiProperty } from '@nestjs/swagger';

export class CreateAuthDto {
  @ApiProperty({
    description: '유저의 Google E-mail Address입니다. 가입 시 사용합니다.',
    example: 'juan.lee@octive.net',
  })
  google_mail?: string;

  @ApiProperty({
    description:
      '유저의 닉네임입니다. 기본적으로 Google display_name 속성이 설정됩니다.',
    example: '주안 이',
  })
  name: string;

  @ApiProperty({
    description:
      '유저의 프로필 사진입니다. 변경이 불가하며, 구글 계정의 프로필 사진이 지정됩니다.',
    example: 'https://example.com/google_profile.png',
  })
  profilePhoto: string;
}
