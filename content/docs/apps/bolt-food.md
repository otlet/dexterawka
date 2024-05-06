---
weight: 10
title: "Aplikacja Bolt Food"
description: "Specyfikacja aplikacji Bolt Food"
icon: "article"
date: "2024-04-26T13:08:32+02:00"
lastmod: "2024-04-26T13:08:32+02:00"
draft: false
toc: true
---
<center>

![](https://s3.amazonaws.com/formaloo-en/f/uploads/ur/df69abcf61767f21/fm/zX02n0tF/BoltFood.png)



### [Rejestracja w Bolt Food](https://bolt.eu/en/food/courier/)

<hr>

</center>

<center>

### Czym jest Bolt Food?

</center>
Bolt Food jest jedną z najmniej znanych platform do rozwożenia jedzenia. Wynika to z okrojnej liczby współprac z restauracjami. Aplikacja ta funkcjonuje w miastach:
* Warszawa
* Łódź
* Kraków
* Trójmiasto (Gdańsk)
* Poznań
* Wrocław
* Toruń (od 18 marca 2024r)

Kurierzy zazwyczaj tą aplikacje traktują jako dodatek ze względu na bardzo małą ilość kursów. Aplikacja swojego czasu oferowała dostawy gotówkowe, lecz się z tego wycofała.

Platforma Bolt jest znana również ze swoich usług **TAXI** w dużej części [świata](https://bolt.eu/en/cities/?utm_source=google&utm_medium=ads&utm_campaign=21079331961&gad_source=1&gclid=Cj0KCQjw0MexBhD3ARIsAEI3WHJeMmGEV0MIKfVGFlCvXFatz2NOldBsd-TOjteFpLV22PSOFYlebk0aArPbEALw_wcB)


<div style="text-align:center">

## Plusy i minusy aplikacji

</div>

{{% alert icon="🟢"context="success" %}}

### Plusy
* Duża swoboda - odrzucamy zamówienia dowoli, logujemy się kiedy chcemy
* Duży zasięg działania w miastach
* Program [zimowe hot-spoty](https://sites.google.com/bolt.eu/rates-model/page_1/zimowe-hotspoty)
* Płacą za oczekiwanie w restauracji na zamówienie (0.22gr/min brutto)
* Wyświetlanie opłaty za kurs przed zaakceptowaniem zamówienia
* Widoczność końcowego adresu dostawy przed zaakceptowaniem zamówienia
* Płacą za dojazd do restauracji (nie we wszystkich miastach)

{{% /alert %}}


{{% alert icon="🔴"context="danger" %}}
### Minusy

* Bardzo mała ilość zamówień
* Bardzo słaby kontakt i dostęp do supportu 
* Mało zamówień
* Jeżeli aplikacja nie jest na wierzchu możemy nie otrzymać powiadomienia o zamówieniu
* Brak przejrzystości stawek
* Brak możliwości współpracy na zasadach [B2B](../begin/2-procesy-aplikacji-do-delivery.md#kontrakt-b2b)
* **Mniejsza ilość kursów dla pojazdu typu ROWER**
{{% /alert %}}

{{<alert context="info" text="Bolt Food wyświetla zarobki w kwotach **BRUTTO** - należy zarobioną kwotę podzielić przez 1.23 aby uzyskać kwotę netto"/>}}

## Strefy i mnożniki

Bolt Food reguluje zarobki na zasadzie mnożników tak samo jak [Uber Eats](7-uber-eats.md). Różnią się one wysokością w zależności od pory dnia, oraz miasta.

Ostatnio Bolt wprowadził coś takiego jak **dynamiczne mnożniki** . Reprezentuje on współczynnik, który jest stosowany do standardowych mnożników widocznych w aplikacji Bolt Courier.

Na przykład: jeśli w danym momencie standardowy mnożnik wynosi 1.3, a obowiązuje aktualnie dodatkowy mnożnik 1.2, na tą konkretną dostawę zostanie zastosowany mnożnik 1.56 (1.3 x 1.2). 
<center>

![](/images/boltfood_showcase/strefy_33.png)
![](/images/boltfood_showcase/strefyd_33.png)

</center>

## Prezentacja aplikacji

<center>

{{<figure src="/images/boltfood_showcase/grafik_moznikow.jpg" width="25%" title="Rozpisane zarobki w poszczególnych porach">}}

{{<figure src="/images/boltfood_showcase/performance_tab.jpg" width="25%" title="Zakładka 'wydajność'">}}

{{<figure src="/images/boltfood_showcase/zamowienie.jpg" width="25%" title="Widok akceptacji zamówienia">}}

{{<figure src="/images/boltfood_showcase/profil.jpg" width="25%" title="Zakładka 'profil'">}}


</center>

<br><br>