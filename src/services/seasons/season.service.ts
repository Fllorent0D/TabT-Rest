import { Injectable } from '@nestjs/common';
import { SeasonEntry } from '../../entity/tabt-soap/TabTAPI_Port';
import { TabtClientService } from '../../common/tabt-client/tabt-client.service';

@Injectable()
export class SeasonService {

  constructor(
    private tabtClient: TabtClientService,
  ) {
  }

  async getSeasons(): Promise<SeasonEntry[]> {
    const result = await this.tabtClient.GetSeasonsAsync({});
    return result.SeasonEntries;
  }

  async getCurrentSeason(): Promise<SeasonEntry> {
    const season = await this.getSeasons();
    return season.find(season => season.IsCurrent);
  }

  async getSeasonById(id: number): Promise<SeasonEntry> {
    const season = await this.getSeasons();
    return season.find(season => season.Season === id);
  }
}
