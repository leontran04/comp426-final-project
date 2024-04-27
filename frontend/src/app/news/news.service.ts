import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthenticationService } from '../authentication.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, map } from 'rxjs';
import { News, parseNewsJson } from './news.model';
import { PaginatedNews, NewsPaginationParams } from '../pagination';

@Injectable({
  providedIn: 'root'
})
export class NewsService {
  constructor(
    protected http: HttpClient,
    protected auth: AuthenticationService,
    protected snackBar: MatSnackBar
  ) {}

  /** Returns all news entries from the backend database table using the backend HTTP get request.
   * @returns {Observable<News[]>}
   */
  getAllNews(): Observable<News[]> {
    return this.http.get<News[]>('/api/news');
  }

  /** Returns the news object from the backend database table using the backend HTTP get request.
   * @param slug: String representing the news slug
   * @returns {Observable<News>}
   */
  getNews(slug: string): Observable<News> {
    return this.http.get<News>('/api/news/' + slug);
  }

  /** Returns the new news object from the backend database table using the backend HTTP post request.
   * @param news: NewsSummary representing the new organization
   * @returns {Observable<News>}
   */
  createNews(news: News): Observable<News> {
    return this.http.post<News>('/api/news', news);
  }

  /** Returns the updated news object from the backend database table using the backend HTTP put request.
   * @param news: NewsSummary representing the updated organization
   * @returns {Observable<News>}
   */
  updateNews(news: News): Observable<News> {
    return this.http.put<News>('/api/news', news);
  }

  /*
  list() {
    return this.http
      .get<News[]>('/api/news')
      .pipe(map((newsJsons) => newsJsons.map(parseNewsJson)));
  }
  */

  list(params: NewsPaginationParams) {
    let paramStrings = {
      order_by: params.order_by,
      ascending: params.ascending,
      filter: params.filter,
      range_start: params.range_start,
      range_end: params.range_end
    };
    let query = new URLSearchParams(paramStrings);
    return this.http.get<PaginatedNews<News>>(
      '/api/news/paginate?' + query.toString()
    );
  }
}
