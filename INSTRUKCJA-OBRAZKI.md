# Obrazki w Kurierpedii

Pliki dodawaj do `assets/images/`. W artykule używaj jednego z poniższych zapisów:

```md
{{< media
  src="/images/moj-obrazek.png"
  alt="Ekran aplikacji z podsumowaniem zarobków"
  caption="Podsumowanie jest dostępne po zakończeniu okresu rozliczeniowego."
  size="md"
  align="center"
>}}
```

`size` może mieć wartość `sm`, `md`, `lg` albo `full`. Dla nietypowego rozmiaru można użyć np. `width="480px"` lub `width="70%"`. `align` przyjmuje `left`, `center` lub `right`.

Zwykły obraz Markdown również jest poprawnie obramowany i skaluje się na telefonie:

```md
![Opis dostępności](/images/moj-obrazek.png "Podpis pod obrazkiem")
```

Do obrazków, które potrzebują podpisu albo kontroli rozmiaru, wybieraj shortcode `media`.
