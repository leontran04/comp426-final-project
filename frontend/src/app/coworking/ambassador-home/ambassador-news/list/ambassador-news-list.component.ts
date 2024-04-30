import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { permissionGuard } from 'src/app/permission.guard';
import { News } from 'src/app/news/news.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AmbassadorNewsService } from '../ambassador-news.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-ambassador-news-list',
  templateUrl: './ambassador-news-list.component.html',
  styleUrls: ['./ambassador-news-list.component.css']
})
export class AmbassadorNewsListComponent {
  /** News List */
  public news$: Observable<News[]>;

  public displayedColumns: string[] = ['headline'];

  /** Route information to be used in Admin Routing Module */
  public static Route = {
    path: 'news',
    component: AmbassadorNewsListComponent,
    title: 'Your Posts',
    canActivate: [permissionGuard('news.list', 'news')]
  };

  constructor(
    private router: Router,
    private snackBar: MatSnackBar,
    private ambassadorNewsService: AmbassadorNewsService
  ) {
    this.news$ = this.ambassadorNewsService.news$;
    ambassadorNewsService.list();
  }

  /** Event handler to open the Organization Editor to create a new organization */
  createNews(): void {
    // Navigate to the org editor for a new organization (slug = create)
    this.router.navigate(['news', 'edit', 'new']);
  }
  editNews(news: News): void {
    this.router.navigate(['news', 'edit', news.slug]);
  }
}
/*import { Component, OnDestroy, OnInit } from '@angular/core';
import { Route } from '@angular/router';
import { Observable } from 'rxjs';
import { News } from 'src/app/news/news.model';
import { permissionGuard } from 'src/app/permission.guard';
import { AmbassadorNewsService } from '../ambassador-news.service';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-ambassador-news-list',
  templateUrl: './ambassador-news-list.component.html',
  styleUrls: ['./ambassador-news-list.component.css']
})
export class AmbassadorNewsListComponent {
  public static Route: Route = {
    path: 'news',
    component: AmbassadorNewsListComponent,
    title: 'Your Posts',
    canActivate: [permissionGuard('coworking.reservation.*', '*')],
    resolve: {}
  };
  news$: Observable<News[]>;
  columnsToDisplay = ['id', 'headline', 'synopsis', 'actions'];

  constructor(public ambassadorService: AmbassadorNewsService) {
    this.news$ = ambassadorService.news$.pipe(
      tap((news) => console.log('News:', news))
    );
  }
}
*/
