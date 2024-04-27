import { Profile } from '../models.module';
import { Organization } from '../organization/organization.model';

export interface News {
  id: number | null;
  headline: string;
  synopsis: string;
  main_story: string;
  user_id: number;
  user: Profile | null;
  organization_id: number | null;
  organization: Organization | null;
  state: State;
  image_url: string | null;
  slug: string;
  pub_date: Date;
  mod_date: Date;
}

export interface NewsJson {
  id: number | null;
  headline: string;
  synopsis: string;
  main_story: string;
  user_id: number;
  user: Profile | null;
  organization_id: number | null;
  organization: Organization | null;
  state: State;
  image_url: string | null;
  slug: string;
  pub_date: string;
  mod_date: string;
}

export const parseNewsJson = (newsJson: NewsJson): News => {
  return Object.assign({}, newsJson, {
    pub_date: new Date(newsJson.pub_date),
    mod_date: new Date(newsJson.mod_date)
  });
};

export enum State {
  DRAFT,
  PUBLISHED,
  ARCHIVED
}
