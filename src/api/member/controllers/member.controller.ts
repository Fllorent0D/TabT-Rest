import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { MemberEntry, PlayerCategoryEntries } from '../../../entity/tabt-soap/TabTAPI_Port';
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { MemberService } from '../../../services/members/member.service';
import { TabtHeadersDecorator } from '../../../common/decorators/tabt-headers.decorator';
import {
  GetMember,
  GetMembers,
  GetPlayerCategoriesInput,
  LookupDTO,
  WeeklyELO,
  WeeklyNumericRanking,
  WeeklyNumericRankingInput,
} from '../dto/member.dto';
import { PlayerCategory } from '../../../entity/tabt-input.interface';
import { EloMemberService } from '../../../services/members/elo-member.service';
import { RequestBySeasonDto } from '../../../common/dto/request-by-season.dto';
import { SeasonService } from '../../../services/seasons/season.service';
import { MembersSearchIndexService } from '../../../services/members/members-search-index.service';

@ApiTags('Members')
@Controller({
  path: 'members',
  version: '1',
})

export class MemberController {

  constructor(
    private memberService: MemberService,
    private eloMemberService: EloMemberService,
    private seasonService: SeasonService,
    private readonly membersSearchIndexService: MembersSearchIndexService,
  ) {
  }

  @Get()
  @ApiOperation({
    operationId: 'findAllMembers',
  })
  @ApiOkResponse({
    type: [MemberEntry],
    description: 'List of players found with specific search criterias',
  })
  @TabtHeadersDecorator()
  async findAll(
    @Query() input: GetMembers,
  ): Promise<MemberEntry[]> {
    return this.memberService.getMembers(
      {
        Club: input.club,
        PlayerCategory: PlayerCategory[input.playerCategory],
        UniqueIndex: input.uniqueIndex,
        NameSearch: input.nameSearch,
        ExtendedInformation: (input.extendedInformation as unknown as string) === 'true',
        RankingPointsInformation: (input.rankingPointsInformation as unknown as string) === 'true',
        WithResults: (input.withResults as unknown as string) === 'true',
        WithOpponentRankingEvaluation: (input.withOpponentRankingEvaluation as unknown as string) === 'true',
      },
    );
  }


  @Get('lookup')
  @ApiOperation({
    operationId: 'findAllMembersLookup',
  })
  @ApiOkResponse({
    type: [MemberEntry],
    description: 'Quick search of a player',
  })
  async searchName(
    @Query() params: LookupDTO,
  ): Promise<any> {
    return this.membersSearchIndexService.search(params.query);
  }

  @Get('categories')
  @ApiOkResponse({
    type: MemberEntry,
    description: 'The categories of a specific player',
  })
  @ApiOperation({
    operationId: 'findMemberCategories',
  })
  @ApiNotFoundResponse()
  @TabtHeadersDecorator()
  @UseInterceptors(ClassSerializerInterceptor)
  async findMemberCategoriesById(
    @Query() input: GetPlayerCategoriesInput,
  ): Promise<PlayerCategoryEntries[]> {
    return await this.memberService.getMembersCategories({
      Season: input.season?.toString(10),
      UniqueIndex: input.uniqueIndex?.toString(10),
      ShortNameSearch: input.shortNameSearch,
      RankingCategory: input.rankingCategory,
    });
  }

  @Get(':uniqueIndex')
  @ApiOkResponse({
    type: MemberEntry,
    description: 'The information of a specific player',
  })
  @ApiOperation({
    operationId: 'findMemberById',
  })
  @ApiNotFoundResponse()
  @TabtHeadersDecorator()
  @UseInterceptors(ClassSerializerInterceptor)
  async findById(
    @Query() input: GetMember,
    @Param('uniqueIndex', ParseIntPipe) id: number,
  ): Promise<MemberEntry> {
    const found = await this.memberService.getMembers({
      Club: input.club,
      PlayerCategory: PlayerCategory[input.playerCategory],
      UniqueIndex: id,
      NameSearch: input.nameSearch,
      ExtendedInformation: (input.extendedInformation as unknown as string) === 'true',
      RankingPointsInformation: (input.rankingPointsInformation as unknown as string) === 'true',
      WithResults: (input.withResults as unknown as string) === 'true',
      WithOpponentRankingEvaluation: (input.withOpponentRankingEvaluation as unknown as string) === 'true',
    });
    if (found.length === 1) {
      return found[0];
    }
    throw new NotFoundException();
  }

  @Get(':uniqueIndex/elo')
  @ApiOkResponse({
    type: [WeeklyELO],
    description: 'The list of ELO points for a player in a season',
  })
  @ApiOperation({
    operationId: 'findMemberEloHistory',
    deprecated: true,
  })
  @ApiNotFoundResponse({
    description: 'No points found for given player',
  })
  async findELOHistory(
    @Param('uniqueIndex', ParseIntPipe) id: number,
    @Query() { season }: RequestBySeasonDto,
  ) {
    if (!season) {
      const currentSeason = await this.seasonService.getCurrentSeason();
      season = currentSeason.Season;
    }
    const elos = await this.eloMemberService.getEloWeekly(id, season);
    if (elos.length) {
      return elos;
    } else {
      throw new NotFoundException('No ELO points found');
    }
  }

  @Get(':uniqueIndex/numeric-rankings')
  @ApiOkResponse({
    type: [WeeklyNumericRanking],
    description: 'The list of ELO points for a player in a season',
  })
  @ApiOperation({
    operationId: 'findMemberNumericRankingsHistory',
  })
  @ApiNotFoundResponse({
    description: 'No points found for given player',
  })
  async findNumericRankings(
    @Param('uniqueIndex', ParseIntPipe) id: number,
    @Query() { season, category }: WeeklyNumericRankingInput,
  ) {
    if (!season) {
      const currentSeason = await this.seasonService.getCurrentSeason();
      season = currentSeason.Season;
    }
    const elos = await this.eloMemberService.getBelNumericRanking(id, season, category);
    if (elos.length) {
      return elos;
    } else {
      throw new NotFoundException('No ELO points found');
    }
  }

}
