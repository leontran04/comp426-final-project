import {
  Component,
  Input,
  Output,
  inject,
  OnInit,
  OnDestroy
} from '@angular/core';
import { Router, ActivatedRoute, ActivationEnd, Params } from '@angular/router';
import {
  Subject,
  debounceTime,
  distinctUntilChanged,
  filter,
  tap,
  Subscription
} from 'rxjs';
import { Organization } from 'src/app/organization/organization.model';
import { News, State } from './news.model';
import { Profile } from '../models.module';
import { NewsService } from './news.service';
import { PaginatedNews } from 'src/app/pagination';

@Component({
  selector: 'app-news',
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.css']
})
export class NewsComponent implements OnInit, OnDestroy {
  public static Route = {
    path: 'news',
    title: 'News',
    component: NewsComponent,
    resolve: {
      page: () => inject(NewsService).list(NewsComponent.NewsPaginationParams)
      //newsGroup: () => inject(NewsService).getAllNews()
    }
  };

  public page: PaginatedNews<News>;
  public startDate = new Date(new Date().setMonth(new Date().getMonth() - 1));
  public endDate = new Date();
  public today: boolean = true;

  private static NewsPaginationParams = {
    order_by: 'mod_date',
    ascending: 'false',
    filter: '',
    range_start: new Date(
      new Date().setMonth(new Date().getMonth() - 1)
    ).toLocaleString('en-GB'),
    range_end: new Date().toLocaleString('en-GB')
  };

  public searchBarQuery = '';

  public searchUpdate = new Subject<string>();

  private routeSubscription!: Subscription;

  public query: string = '';

  @Input() newsGroup: News[] = [];

  @Input() organization: Organization | null = null;

  @Input() selectedNews: News | null = null;

  //@Output() clickNews: EventEmitter<News> = new EventEmitter();

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    public newsService: NewsService
  ) {
    const data = this.route.snapshot.data as {
      profile: Profile;
      newsGroups: News[];
      page: PaginatedNews<News>;
    };

    this.searchUpdate
      .pipe(
        filter((search: string) => search.length > 2 || search.length == 0),
        debounceTime(500),
        distinctUntilChanged()
      )
      .subscribe((query) => {
        this.onSearchBarQueryChange(query);
      });

    let dummyAuthor: Profile = {
      id: 12345,
      pid: 12345,
      onyen: 'dummy',
      first_name: 'First name',
      last_name: 'Last name',
      email: null,
      pronouns: null,
      registered: true,
      role: 1,
      permissions: [],
      github: null,
      github_id: null,
      github_avatar: null,
      accepted_community_agreement: true
    };
    let dummyNews: News = {
      id: null,
      headline: 'Headline',
      synopsis: 'Synopsis',
      main_story: 'news news news news news news news',
      user_id: -1,
      user: dummyAuthor,
      organization_id: null,
      organization: null,
      state: State.PUBLISHED,
      image_url: null,
      slug: 'slug',
      pub_date: new Date(),
      mod_date: new Date()
    };
    //this.newsGroup.push(dummyNews);

    this.page = data.page;
    console.log(this.page);
    //this.newsGroup = data.newsGroups;
    this.newsGroup = this.page.items;
    this.today =
      this.endDate.setHours(23, 59, 59, 999) ==
      new Date().setHours(23, 59, 59, 999);
  }

  onSearchBarQueryChange(query: string) {
    this.query = query;
    let paginationParams = this.page.params;
    paginationParams.ascending = 'true';
    if (query == '') {
      paginationParams.range_start = this.startDate.toLocaleString('en-GB');
      paginationParams.range_end = this.endDate.toLocaleString('en-GB');
    } else {
      paginationParams.range_start = new Date(
        new Date().setFullYear(new Date().getFullYear() - 100)
      ).toLocaleString('en-GB');
      paginationParams.range_end = new Date(
        new Date().setFullYear(new Date().getFullYear() + 100)
      ).toLocaleString('en-GB');
      paginationParams.filter = this.query;
    }

    console.log('search');
    this.newsService.list(paginationParams).subscribe((page) => {
      this.newsGroup = page.items;
      paginationParams.filter = '';
    });
  }

  clickNews(news: News) {
    this.selectedNews = news;
  }

  /** Runs when the frontend UI loads */
  ngOnInit() {
    // Watch current route's query params
    this.route.queryParams.subscribe((params: Params): void => {
      /*
      let start_date = new Date(Date.parse(params['start_date']));
      this.startDate = params['start_date']
        ? new Date(start_date.setMonth(start_date.getMonth() - 1))
        : new Date(new Date().setMonth(new Date().getMonth() - 1));
      */
      this.startDate = params['start_date']
        ? new Date(Date.parse(params['start_date']))
        : new Date(new Date().setMonth(new Date().getMonth() - 1));
      this.endDate = params['end_date']
        ? new Date(Date.parse(params['end_date']))
        : new Date();
    });

    this.today =
      this.endDate.setHours(23, 59, 59, 999) ==
      new Date().setHours(23, 59, 59, 999);

    const today = new Date();
    if (this.startDate.getTime() < today.setHours(0, 0, 0, 0)) {
      this.page.params.ascending = 'false';
    }

    let paginationParams = this.page.params;
    paginationParams.range_start = this.startDate.toLocaleString('en-GB');
    paginationParams.range_end = this.endDate.toLocaleString('en-GB');
    this.newsService.list(paginationParams).subscribe((page) => {
      this.newsGroup = page.items;
      console.log(paginationParams.range_end);
    });

    let prevUrl = '';
    this.routeSubscription = this.router.events
      .pipe(
        filter((e) => e instanceof ActivationEnd),
        distinctUntilChanged(() => this.router.url === prevUrl),
        tap(() => (prevUrl = this.router.url))
      )
      .subscribe((_) => {
        this.page.params.ascending = (
          this.startDate.getTime() > today.setHours(0, 0, 0, 0)
        ).toString();
        let paginationParams = this.page.params;
        paginationParams.range_start = this.startDate.toLocaleString('en-GB');
        paginationParams.range_end = this.endDate.toLocaleString('en-GB');
        this.newsService.list(paginationParams).subscribe((page) => {
          this.newsGroup = page.items;
        });
      });
  }

  ngOnDestroy() {
    this.routeSubscription.unsubscribe();
  }

  showNews(isPrevious: boolean) {
    //let paginationParams = this.page.params;
    this.startDate = isPrevious
      ? new Date(this.startDate.setMonth(this.startDate.getMonth() - 1))
      : new Date(this.startDate.setMonth(this.startDate.getMonth() + 1));
    this.endDate = isPrevious
      ? new Date(this.endDate.setMonth(this.endDate.getMonth() - 1))
      : new Date(this.endDate.setMonth(this.endDate.getMonth() + 1));

    if (isPrevious === true) {
      this.page.params.ascending = 'false';
    }

    this.today =
      this.endDate.setHours(23, 59, 59, 999) ==
      new Date().setHours(23, 59, 59, 999);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        start_date: this.startDate.toISOString(),
        end_date: this.endDate.toISOString()
      },
      queryParamsHandling: 'merge'
    });
    console.log(this.page);
  }
}
