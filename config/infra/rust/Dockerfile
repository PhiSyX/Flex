FROM rust:latest as builder

ENV PATH="/root/.cargo/bin:${PATH}"

RUN apt-get update -y
RUN apt-get install -y \
	libpq-dev \
	libssl-dev \
	openssl \
	pkg-config \
	software-properties-common \
	curl

RUN bash -c "$(wget -O - https://apt.llvm.org/llvm.sh)"
RUN apt-get update -y && apt-get install -y

# SCCache
RUN --mount=type=cache,target=/usr/local/cargo/registry \
	CARGO_REGISTRIES_CRATES_IO_PROTOCOL=sparse cargo install sccache
RUN --mount=type=cache,target=/usr/local/cargo/registry \
	--mount=type=cache,target=/root/.cache/sccache \
	RUSTC_WRAPPER=/usr/local/cargo/bin/sccache

ARG MOLD_VERSION=2.34.0

# Mold - Fast Rust Linker
RUN    curl -OL https://github.com/rui314/mold/releases/download/v$MOLD_VERSION/mold-$MOLD_VERSION-x86_64-linux.tar.gz \
	&& tar -xf mold-$MOLD_VERSION-x86_64-linux.tar.gz \
	&& mv ./mold-$MOLD_VERSION-x86_64-linux/bin/mold /usr/local/bin/ \
	&& mv ./mold-$MOLD_VERSION-x86_64-linux/lib/mold/mold-wrapper.so /usr/local/bin/ \
	&& rm mold-$MOLD_VERSION-x86_64-linux.tar.gz \
	&& rm -rf ./mold-$MOLD_VERSION-x86_64-linux \
	&& chmod +x /usr/local/bin/mold

WORKDIR /app

CMD cargo build --release --workspace --all-features
