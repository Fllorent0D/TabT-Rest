import { ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { GetMembers } from '../../member/dto/member.dto';
import { ClubCategory } from '../../../entity/tabt-input.interface';

export class ListAllClubs {
  @ApiPropertyOptional({ enum: ClubCategory })
  clubCategory: string;
}

export class GetMembersFromClub extends OmitType(GetMembers, ['club'] as const) {
}
