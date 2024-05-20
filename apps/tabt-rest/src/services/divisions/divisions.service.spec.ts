import { Test, TestingModule } from '@nestjs/testing';
import { TabtClientService } from '../../common/tabt-client/tabt-client.service';
import { DivisionEntry } from '../../entity/tabt-soap/TabTAPI_Port';
import { DivisionService } from './division.service';

describe('DivisionService', () => {
  let service: DivisionService;
  let tabtService: TabtClientService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DivisionService,
        {
          provide: TabtClientService,
          useValue: {
            GetDivisionsAsync: jest.fn(),
          },
        },
      ],
    }).compile();
    tabtService = module.get<TabtClientService>(TabtClientService);
    service = module.get<DivisionService>(DivisionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getDivisions', () => {
    it('should call the tabt service correctly and returns the division entries', async () => {
      const divisions = [{
        'DivisionId': 4755,
        'DivisionName': 'Super Heren - Super Division - Hommes',
        'DivisionCategory': 1,
        'Level': 1,
        'MatchType': 8,
      },{
        'DivisionId': 123,
        'DivisionName': 'test',
        'DivisionCategory': 1,
        'Level': 1,
        'MatchType': 8,
      }] as DivisionEntry[];
      const spyOnTabt = jest.spyOn(tabtService, 'GetDivisionsAsync').mockResolvedValue({
        DivisionCount: 2,
        DivisionEntries: divisions,
      });
      const input = {};

      const result = await service.getDivisions(input);

      expect(result).toBeDefined();
      expect(spyOnTabt).toBeCalledTimes(1);
      expect(spyOnTabt).toBeCalledWith(input);
    });
    it('should call the tabt service correctly and returns the exact division entries', async () => {
      const divisions = [{
        'DivisionId': 4755,
        'DivisionName': 'Super Heren - Super Division - Hommes',
        'DivisionCategory': 1,
        'Level': 1,
        'MatchType': 8,
      },{
        'DivisionId': 123,
        'DivisionName': 'test',
        'DivisionCategory': 1,
        'Level': 1,
        'MatchType': 8,
      }] as DivisionEntry[];
      const spyOnTabt = jest.spyOn(tabtService, 'GetDivisionsAsync').mockResolvedValue({
        DivisionCount: 2,
        DivisionEntries: divisions,
      });
      const input = {};

      const result = await service.getDivisionsById(4755, input);

      expect(result).toBeDefined();
      expect(spyOnTabt).toBeCalledTimes(1);
      expect(spyOnTabt).toBeCalledWith(input);
    });

    it('should call the tabt service correctly and returns null if not found', async () => {
      const divisions = [] as DivisionEntry[];
      const spyOnTabt = jest.spyOn(tabtService, 'GetDivisionsAsync').mockResolvedValue({
        DivisionCount: 0,
        DivisionEntries: divisions,
      });
      const input = {};

      const result = await service.getDivisionsById(123, input);

      expect(result).toBeUndefined();
      expect(spyOnTabt).toBeCalledTimes(1);
      expect(spyOnTabt).toBeCalledWith(input);
    });
  });
});
