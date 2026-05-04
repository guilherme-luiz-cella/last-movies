@if(isset($section['groups']))
    <section class="content-row {{ $section['class'] ?? '' }}">
        <div class="row-heading">
            <h2>{{ $section['title'] }}</h2>
            @isset($section['count'])
                <span>{{ $section['count'] }}</span>
            @endisset
        </div>

        @foreach($section['groups'] as $group)
            @include('movies.partials.section', ['section' => $group])
        @endforeach
    </section>
@else
    <section class="content-row {{ $section['class'] ?? '' }}">
        <div class="row-heading row-heading-small">
            <h3>{{ $section['title'] }}</h3>
        </div>
        <div class="movies-grid">
            @foreach($section['movies'] as $movie)
                @include('movies.partials.card', ['movie' => $movie])
            @endforeach
        </div>
    </section>
@endif
