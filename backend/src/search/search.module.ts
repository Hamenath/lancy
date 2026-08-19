import { Module } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { PostgresSearchProvider } from './providers/postgres-search.provider';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [SearchController],
  providers: [SearchService, PostgresSearchProvider],
  exports: [SearchService],
})
export class SearchModule {}
