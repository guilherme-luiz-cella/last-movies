<?php

namespace App\Models;

use App\Components\Enum\MovieTypeEnum;
use App\Components\Enum\StatusTypeEnum;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Movie extends Model
{
    use HasFactory;

    protected $fillable = [
        'type',
        'title',
        'year',
        'seasons',
        'episodes',
        'imdb_id',
        'tmdb_id',
        'poster_url',
        'overview',
        'status',
        'watched_at',
    ];

    protected $casts = [
        'watched_at' => 'datetime',
        'seasons' => 'integer',
        'episodes' => 'integer',
    ];

    public function scopeMovies(Builder $query): Builder
    {
        return $query->where('type', MovieTypeEnum::MOVIE);
    }

    public function scopeSeries(Builder $query): Builder
    {
        return $query->where('type', MovieTypeEnum::SERIES);
    }

    public function scopeOfType(Builder $query, ?string $type): Builder
    {
        return $type ? $query->where('type', $type) : $query;
    }

    public function scopeStatus(Builder $query, ?string $status): Builder
    {
        return $status ? $query->where('status', $status) : $query;
    }

    public function scopePending(Builder $query): Builder
    {
        return $query->status(StatusTypeEnum::PENDING);
    }

    public function scopeWatching(Builder $query): Builder
    {
        return $query->status(StatusTypeEnum::WATCHING);
    }

    public function scopeWatched(Builder $query): Builder
    {
        return $query->status(StatusTypeEnum::WATCHED);
    }

    public function isMovie(): bool
    {
        return MovieTypeEnum::isMovie($this->type);
    }

    public function isSeries(): bool
    {
        return $this->type === MovieTypeEnum::SERIES;
    }

    public function getTypeLabel(): string
    {
        return MovieTypeEnum::label($this->type);
    }

    public function getStatusLabel(): string
    {
        return StatusTypeEnum::label($this->status);
    }
}
