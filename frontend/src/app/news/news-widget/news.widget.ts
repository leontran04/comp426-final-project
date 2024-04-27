import { Component, EventEmitter, Output, Input } from '@angular/core';
import { News } from '../news.model';

@Component({
  selector: 'news-widget',
  templateUrl: './news.widget.html',
  styleUrls: ['./news.widget.css']
})
export class NewsWidget {
  @Input() news!: News;

  @Input() selected: Boolean = false;

  @Output() clickNews = new EventEmitter<News>();

  constructor() {}

  /*
  clickNews() {
    this.clicked.emit(this.news);
  }
  */
}
